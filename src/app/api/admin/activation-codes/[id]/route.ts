import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

const patchSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  businessName: z.string().trim().min(2).max(255).optional(),
  note: z.string().trim().max(1000).nullable().optional(),
  projectId: z.string().uuid().optional(),
})

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = patchSchema.parse(await request.json())
    const updates: {
      status?: 'active' | 'inactive'
      business_name?: string
      note?: string | null
      project_id?: string
    } = {}
    if (body.status) updates.status = body.status
    if (body.businessName) updates.business_name = body.businessName
    if (body.note !== undefined) updates.note = body.note
    if (body.projectId) updates.project_id = body.projectId

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan yok.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('activation_codes')
      .update(updates)
      .eq('id', id)
      .select('id, code, project_id, business_name, status, note, created_at, last_used_at')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Kod güncellenemedi.' }, { status: 500 })
    }
    return NextResponse.json({ success: true, code: data })
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('activation_codes').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: 'Kod silinemedi.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
