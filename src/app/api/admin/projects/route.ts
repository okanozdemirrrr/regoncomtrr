import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug küçük harf ve tire olmalı.'),
  status: z.enum(['active', 'beta', 'archived']).optional().default('active'),
})

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, name, status, created_at')
    .order('name', { ascending: true })

  if (error) {
    console.error('[admin/projects GET]', error.message, error.hint ?? '')
    return NextResponse.json(
      {
        error:
          error.message === 'Invalid API key'
            ? 'Supabase service_role anahtarı geçersiz. .env.local içindeki SUPABASE_SERVICE_ROLE_KEY değerini Dashboard → API Keys → service_role ile güncelle.'
            : 'Projeler alınamadı.',
      },
      { status: 500 },
    )
  }
  return NextResponse.json({ projects: data ?? [] })
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
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: body.name,
        slug: body.slug,
        status: body.status,
      })
      .select('id, slug, name, status, created_at')
      .single()

    if (error || !data) {
      if (error?.code === '23505') {
        return NextResponse.json({ error: 'Bu slug zaten var.' }, { status: 409 })
      }
      console.error('[admin/projects POST]', error?.message, error?.hint ?? '')
      return NextResponse.json(
        {
          error:
            error?.message === 'Invalid API key'
              ? 'Supabase service_role anahtarı geçersiz. .env.local içindeki SUPABASE_SERVICE_ROLE_KEY değerini Dashboard → API Keys → service_role ile güncelle.'
              : 'Proje oluşturulamadı.',
        },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: true, project: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Geçersiz istek.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
}
