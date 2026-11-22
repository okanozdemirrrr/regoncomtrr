import { NextResponse } from 'next/server'
import { getPortalContext } from '@/lib/portal'
import { getTicketMessages } from '@/lib/ticket-api'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getPortalContext()
  if (!session) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, category, status, subject, created_at, updated_at, last_message_at, project_id, activation_code_id')
    .eq('id', id)
    .eq('activation_code_id', session.activationCodeId)
    .maybeSingle()

  if (!ticket) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })
  }

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
    },
    messages,
  })
}
