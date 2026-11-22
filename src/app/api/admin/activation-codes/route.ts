import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateActivationCode,
  isValidActivationCodeFormat,
  normalizeActivationCode,
} from '@/lib/activation-code'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  projectId: z.string().uuid(),
  businessName: z.string().trim().min(2).max(255),
  code: z.string().optional(),
  note: z.string().trim().max(1000).optional().nullable(),
})

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('activation_codes')
    .select('id, code, project_id, business_name, status, note, created_at, last_used_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/activation-codes GET]', error.message, error.hint ?? '')
    return NextResponse.json(
      {
        error:
          error.message === 'Invalid API key'
            ? 'Supabase service_role anahtarı geçersiz. .env.local → SUPABASE_SERVICE_ROLE_KEY güncelle.'
            : 'Kodlar alınamadı.',
      },
      { status: 500 },
    )
  }

  const projectIds = [...new Set((data ?? []).map((c) => c.project_id))]
  const { data: projects } = projectIds.length
    ? await supabase.from('projects').select('id, name').in('id', projectIds)
    : { data: [] as { id: string; name: string }[] }

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.name]))

  return NextResponse.json({
    codes: (data ?? []).map((row) => ({
      ...row,
      projectName: projectMap.get(row.project_id) ?? null,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  try {
    const body = createSchema.parse(await request.json())
    let code = body.code ? normalizeActivationCode(body.code) : generateActivationCode()

    if (!isValidActivationCodeFormat(code)) {
      return NextResponse.json(
        { error: 'Kod biçimi 3 harf + 3 rakam olmalı (örn. RGN104).' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServerClient()

    // Benzersizlik: çakışırsa otomatik üretimde birkaç kez dene
    for (let attempt = 0; attempt < 8; attempt++) {
      const { data, error } = await supabase
        .from('activation_codes')
        .insert({
          code,
          project_id: body.projectId,
          business_name: body.businessName,
          status: 'active',
          note: body.note ?? null,
        })
        .select('id, code, project_id, business_name, status, note, created_at')
        .single()

      if (!error && data) {
        return NextResponse.json({ success: true, code: data })
      }

      if (error?.code === '23505') {
        if (body.code) {
          return NextResponse.json({ error: 'Bu kod zaten kayıtlı.' }, { status: 409 })
        }
        code = generateActivationCode()
        continue
      }

      return NextResponse.json({ error: 'Kod oluşturulamadı.' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Benzersiz kod üretilemedi. Tekrar deneyin.' }, { status: 500 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Geçersiz istek.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
}
