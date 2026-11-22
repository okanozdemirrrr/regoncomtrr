import 'server-only'
import { createAttachmentSignedUrl } from '@/lib/attachments'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { TicketCategory, TicketStatus } from '@/lib/support'
import type {
  TicketAttachmentDto,
  TicketListItem,
  TicketMessageDto,
} from '@/types/support'

export type { TicketAttachmentDto, TicketListItem, TicketMessageDto }

export async function listTicketsForCode(activationCodeId: string): Promise<TicketListItem[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('id, category, status, subject, created_at, updated_at, last_message_at, project_id')
    .eq('activation_code_id', activationCodeId)
    .order('last_message_at', { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    category: row.category,
    status: row.status,
    subject: row.subject,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessageAt: row.last_message_at,
    projectId: row.project_id,
  }))
}

export async function listTicketsAdmin(filters: {
  category?: TicketCategory | 'all'
  status?: TicketStatus | 'all'
  projectId?: string | 'all'
}): Promise<TicketListItem[]> {
  const supabase = getSupabaseServerClient()
  let query = supabase
    .from('tickets')
    .select(
      'id, category, status, subject, created_at, updated_at, last_message_at, project_id, activation_code_id',
    )
    .order('last_message_at', { ascending: false })

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.projectId && filters.projectId !== 'all') {
    query = query.eq('project_id', filters.projectId)
  }

  const { data, error } = await query
  if (error || !data) return []

  const projectIds = [...new Set(data.map((t) => t.project_id))]
  const codeIds = [...new Set(data.map((t) => t.activation_code_id))]

  const [{ data: projects }, { data: codes }] = await Promise.all([
    projectIds.length
      ? supabase.from('projects').select('id, name').in('id', projectIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    codeIds.length
      ? supabase.from('activation_codes').select('id, business_name, code').in('id', codeIds)
      : Promise.resolve({ data: [] as { id: string; business_name: string; code: string }[] }),
  ])

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.name]))
  const codeMap = new Map(
    (codes ?? []).map((c) => [c.id, { businessName: c.business_name, code: c.code }]),
  )

  const items = data.map((row) => {
    const code = codeMap.get(row.activation_code_id)
    return {
      id: row.id,
      category: row.category,
      status: row.status,
      subject: row.subject,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      projectId: row.project_id,
      projectName: projectMap.get(row.project_id),
      businessName: code?.businessName,
      activationCode: code?.code,
    }
  })

  // Çökme bildirimleri en üstte
  items.sort((a, b) => {
    const aCrash = a.category === 'crash' ? 0 : 1
    const bCrash = b.category === 'crash' ? 0 : 1
    if (aCrash !== bCrash) return aCrash - bCrash
    return Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)
  })

  return items
}

export async function getTicketMessages(ticketId: string): Promise<TicketMessageDto[]> {
  const supabase = getSupabaseServerClient()
  const { data: messages, error } = await supabase
    .from('ticket_messages')
    .select('id, sender, body, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error || !messages) return []

  const messageIds = messages.map((m) => m.id)
  const { data: attachments } = messageIds.length
    ? await supabase
        .from('ticket_attachments')
        .select('id, message_id, storage_path, file_name, file_size, mime_type')
        .in('message_id', messageIds)
    : { data: [] as never[] }

  const byMessage = new Map<string, TicketAttachmentDto[]>()
  for (const att of attachments ?? []) {
    const url = await createAttachmentSignedUrl(att.storage_path)
    const list = byMessage.get(att.message_id) ?? []
    list.push({
      id: att.id,
      fileName: att.file_name,
      fileSize: att.file_size,
      mimeType: att.mime_type,
      url,
    })
    byMessage.set(att.message_id, list)
  }

  return messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    body: m.body,
    createdAt: m.created_at,
    attachments: byMessage.get(m.id) ?? [],
  }))
}
