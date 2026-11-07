import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateSessionToken,
  hashActivationCode,
  hashIpAddress,
  hashSessionToken,
  isIpLocked,
  isValidActivationCodeFormat,
  RATE_LIMIT,
  SESSION_TTL,
} from '@/lib/activation-code'
import { getEnv } from '@/lib/env'
import { PORTAL_COOKIE_NAME } from '@/lib/portal'
import { assertSameOrigin, portalCookieName } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  code: z.string().min(1),
})

const GENERIC_INVALID =
  'Kod geçersiz veya süresi dolmuş. Sorun devam ederse bize ulaşın.'
const GENERIC_LOCKED = 'Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.'
const GENERIC_SERVER = 'Giriş hatası. Lütfen daha sonra tekrar deneyin.'
const GENERIC_CSRF = 'İstek reddedildi. Sayfayı yenileyip tekrar deneyin.'

function wantsJson(request: NextRequest) {
  return (request.headers.get('content-type') ?? '').includes('application/json')
}

function fail(request: NextRequest, message: string, status: number) {
  if (wantsJson(request)) {
    return NextResponse.json({ error: message }, { status })
  }
  const params = new URLSearchParams({ hata: message })
  redirect(`/portal/giris?${params.toString()}`)
}

async function readCode(request: NextRequest): Promise<string> {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body: unknown = await request.json()
    return loginSchema.parse(body).code
  }
  const form = await request.formData()
  return loginSchema.parse({ code: form.get('code') }).code
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!assertSameOrigin(request)) {
      return fail(request, GENERIC_CSRF, 403)
    }

    const env = getEnv()
    const rawCode = await readCode(request)

    if (!isValidActivationCodeFormat(rawCode)) {
      // Biçim hatalı: DB'ye gitmeden genel hata (yine de rate-limit kaydı)
      const ipHash = hashIpAddress(clientIp(request), env.IP_HASH_SALT)
      const supabase = getSupabaseServerClient()
      await supabase.from('portal_login_attempts').insert({
        ip_hash: ipHash,
        success: false,
      })
      return fail(request, GENERIC_INVALID, 400)
    }

    const ipHash = hashIpAddress(clientIp(request), env.IP_HASH_SALT)
    const supabase = getSupabaseServerClient()
    const windowStart = new Date(Date.now() - RATE_LIMIT.windowMs).toISOString()

    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('portal_login_attempts')
      .select('success')
      .eq('ip_hash', ipHash)
      .gte('created_at', windowStart)

    if (attemptsError) {
      console.error('Rate limit kontrol hatası')
      return fail(request, GENERIC_SERVER, 500)
    }

    const failedAttempts = (recentAttempts ?? []).filter((row) => !row.success).length
    if (isIpLocked(failedAttempts)) {
      return fail(request, GENERIC_LOCKED, 429)
    }

    const codeHash = hashActivationCode(rawCode, env.ACTIVATION_PEPPER)
    const { data: activationCode, error: codeError } = await supabase
      .from('activation_codes')
      .select('id, tenant_id, status, expires_at')
      .eq('code_hash', codeHash)
      .eq('status', 'active')
      .maybeSingle()

    const reject = async () => {
      await supabase.from('portal_login_attempts').insert({
        ip_hash: ipHash,
        success: false,
      })
      return fail(request, GENERIC_INVALID, 400)
    }

    if (codeError || !activationCode) {
      return reject()
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, slug, is_active')
      .eq('id', activationCode.tenant_id)
      .maybeSingle()

    if (tenantError || !tenant || !tenant.is_active) {
      return reject()
    }

    if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      await supabase
        .from('activation_codes')
        .update({ status: 'expired' })
        .eq('id', activationCode.id)
      return reject()
    }

    const { data: links } = await supabase
      .from('activation_code_projects')
      .select('project_id')
      .eq('code_id', activationCode.id)

    const projectIds = (links ?? []).map((row) => row.project_id)
    let projects: { id: string; slug: string; name: string }[] = []
    if (projectIds.length > 0) {
      const { data: projectRows } = await supabase
        .from('projects')
        .select('id, slug, name')
        .in('id', projectIds)
      projects = projectRows ?? []
    }

    const now = Date.now()
    const token = generateSessionToken()
    const tokenHash = hashSessionToken(token)
    const idleExpires = new Date(now + SESSION_TTL.idleMs)
    const absoluteExpires = new Date(now + SESSION_TTL.absoluteMs)
    const userAgent = request.headers.get('user-agent') || null

    const { error: sessionError } = await supabase.from('portal_sessions').insert({
      tenant_id: tenant.id,
      code_id: activationCode.id,
      token_hash: tokenHash,
      expires_at: idleExpires.toISOString(),
      absolute_expires_at: absoluteExpires.toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
    })

    if (sessionError) {
      console.error('Oturum oluşturma hatası')
      return fail(request, GENERIC_SERVER, 500)
    }

    await supabase
      .from('activation_codes')
      .update({ last_used_at: new Date(now).toISOString() })
      .eq('id', activationCode.id)

    await supabase.from('portal_login_attempts').insert({
      ip_hash: ipHash,
      success: true,
    })

    const cookieStore = await cookies()
    const cookieName = portalCookieName()
    // Cookie mutlak tavan kadar yaşar; boşta kalma süresi DB expires_at ile yönetilir
    cookieStore.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: absoluteExpires,
      maxAge: Math.floor(SESSION_TTL.absoluteMs / 1000),
    })

    // Eski cookie adını temizle (geçiş)
    if (cookieName !== PORTAL_COOKIE_NAME) {
      cookieStore.delete('portal_session')
    }

    if (wantsJson(request)) {
      return NextResponse.json({
        success: true,
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        projects,
      })
    }

    redirect('/portal')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(request, GENERIC_INVALID, 400)
    }
    throw error
  }
}
