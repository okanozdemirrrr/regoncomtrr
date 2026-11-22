import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { uploadSupportAttachment } from '@/lib/attachments'
import { assertSameOrigin } from '@/lib/portal-security'
import { getTicketMessages } from '@/lib/ticket-api'
import { getSupabaseServerClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

const bodySchema = z.object({
  body: z.string().trim().optional().default(''),
})

export async function POST(request: NextRequest, { params }: Params) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getSupabaseServerClient()
  const { data: ticket } = await supabase.from('tickets').select('id').eq('id', id).maybeSingle()
  if (!ticket) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  let text = ''
  let file: File | null = null

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      text = bodySchema.parse({ body: form.get('body') ?? '' }).body
      const raw = form.get('file')
      file = raw instanceof File && raw.size > 0 ? raw : null
    } else {
      text = bodySchema.parse(await request.json()).body
    }
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  if (!text && !file) {
    return NextResponse.json({ error: 'Mesaj veya dosya gerekli.' }, { status: 400 })
  }

  const { data: message, error: messageError } = await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: ticket.id,
      sender: 'admin',
      body: text || (file ? 'Dosya eklendi.' : ''),
    })
    .select('id')
    .single()

  if (messageError || !message) {
    return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 500 })
  }

  if (file) {
    try {
      const uploaded = await uploadSupportAttachment(ticket.id, file)
      await supabase.from('ticket_attachments').insert({
        message_id: message.id,
        ticket_id: ticket.id,
        storage_path: uploaded.storagePath,
        file_name: uploaded.fileName,
        file_size: uploaded.fileSize,
        mime_type: uploaded.mimeType,
      })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Dosya yüklenemedi.' },
        { status: 400 },
      )
    }
  }

  await supabase
    .from('tickets')
    .update({
      last_message_at: new Date().toISOString(),
      status: 'reviewing',
    })
    .eq('id', ticket.id)

  const messages = await getTicketMessages(ticket.id)
  return NextResponse.json({ success: true, messages })
}
