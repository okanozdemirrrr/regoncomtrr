import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateSessionToken,
  hashIpAddress,
  hashSessionToken,
  isIpLocked,
  isValidActivationCodeFormat,
  normalizeActivationCode,
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

const GENERIC_INVALID = 'Kod geçersiz veya pasif. Sorun devam ederse bize ulaşın.'
const GENERIC_LOCKED = 'Çok fazla başarısız deneme. 2 dakika sonra tekrar deneyin.'
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
    const code = normalizeActivationCode(rawCode)
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

    const reject = async () => {
      await supabase.from('portal_login_attempts').insert({
        ip_hash: ipHash,
        success: false,
      })
      return fail(request, GENERIC_INVALID, 400)
    }

    if (!isValidActivationCodeFormat(code)) {
      return reject()
    }

    const { data: activationCode, error: codeError } = await supabase
      .from('activation_codes')
      .select('id, code, business_name, status, project_id')
      .eq('code', code)
      .eq('status', 'active')
      .maybeSingle()

    if (codeError || !activationCode) {
      return reject()
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, slug, name')
      .eq('id', activationCode.project_id)
      .maybeSingle()

    if (!project) {
      return reject()
    }

    const now = Date.now()
    const token = generateSessionToken()
    const tokenHash = hashSessionToken(token)
    const idleExpires = new Date(now + SESSION_TTL.idleMs)
    const absoluteExpires = new Date(now + SESSION_TTL.absoluteMs)
    const userAgent = request.headers.get('user-agent') || null

    const { error: sessionError } = await supabase.from('portal_sessions').insert({
      activation_code_id: activationCode.id,
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

    if (cookieName !== PORTAL_COOKIE_NAME) {
      cookieStore.delete('portal_session')
    }

    if (wantsJson(request)) {
      return NextResponse.json({
        success: true,
        businessName: activationCode.business_name,
        project,
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
