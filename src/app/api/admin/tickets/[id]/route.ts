import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'
import { getTicketMessages } from '@/lib/ticket-api'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

const statusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'resolved']),
})

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { data: ticket } = await supabase
    .from('tickets')
    .select(
      'id, category, status, subject, created_at, updated_at, last_message_at, project_id, activation_code_id',
    )
    .eq('id', id)
    .maybeSingle()

  if (!ticket) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })
  }

  const [{ data: project }, { data: code }] = await Promise.all([
    supabase.from('projects').select('id, name, slug').eq('id', ticket.project_id).maybeSingle(),
    supabase
      .from('activation_codes')
      .select('id, code, business_name')
      .eq('id', ticket.activation_code_id)
      .maybeSingle(),
  ])

  const messages = await getTicketMessages(ticket.id)

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      category: ticket.category,
      status: ticket.status,
      subject: ticket.subject,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      lastMessageAt: ticket.last_message_at,
      projectId: ticket.project_id,
      projectName: project?.name,
      businessName: code?.business_name,
      activationCode: code?.code,
    },
    messages,
  })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { id } = await params
  try {
    const { status } = statusSchema.parse(await request.json())
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Durum güncellenemedi.' }, { status: 500 })
    }
    return NextResponse.json({ success: true, status: data.status })
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
}
