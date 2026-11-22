import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { uploadSupportAttachment } from '@/lib/attachments'
import { assertSameOrigin } from '@/lib/portal-security'
import { getPortalContext } from '@/lib/portal'
import { listTicketsForCode } from '@/lib/ticket-api'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { TicketCategory } from '@/lib/support'
import { sendTelegramNotification } from '@/lib/telegram'

const createSchema = z.object({
  category: z.enum(['bug', 'crash', 'paid_revision']),
  body: z.string().trim().min(1, 'Mesaj gerekli.'),
})

export async function GET() {
  const session = await getPortalContext()
  if (!session) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 })
  }

  const tickets = await listTicketsForCode(session.activationCodeId)
  return NextResponse.json({ tickets })
}

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }

  const session = await getPortalContext()
  if (!session) {
    return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  let category: TicketCategory
  let body: string
  let file: File | null = null

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const parsed = createSchema.parse({
        category: form.get('category'),
        body: form.get('body') ?? '',
      })
      category = parsed.category
      body = parsed.body
      const raw = form.get('file')
      file = raw instanceof File && raw.size > 0 ? raw : null
    } else {
      const json = createSchema.parse(await request.json())
      category = json.category
      body = json.body
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Geçersiz istek.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()
  const subject =
    category === 'crash'
      ? 'Çökme bildirimi'
      : category === 'paid_revision'
        ? 'Ücretli revizyon'
        : 'Hata bildirimi'

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      activation_code_id: session.activationCodeId,
      project_id: session.project.id,
      category,
      status: 'pending',
      subject,
    })
    .select('id')
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Talep oluşturulamadı.' }, { status: 500 })
  }

  const { data: message, error: messageError } = await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: ticket.id,
      sender: 'customer',
      body,
    })
    .select('id')
    .single()

  if (messageError || !message) {
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return NextResponse.json({ error: 'Mesaj kaydedilemedi.' }, { status: 500 })
  }

  let uploadedFileName: string | null = null
  if (file) {
    try {
      const uploaded = await uploadSupportAttachment(ticket.id, file)
      uploadedFileName = uploaded.fileName
      const { error: attError } = await supabase.from('ticket_attachments').insert({
        message_id: message.id,
        ticket_id: ticket.id,
        storage_path: uploaded.storagePath,
        file_name: uploaded.fileName,
        file_size: uploaded.fileSize,
        mime_type: uploaded.mimeType,
      })
      if (attError) {
        console.error('Ek kaydı hatası')
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Dosya yüklenemedi.', ticketId: ticket.id },
        { status: 400 },
      )
    }
  }

  await sendTelegramNotification({
    kind: 'new_ticket',
    businessName: session.businessName,
    projectName: session.project.name,
    category,
    body,
    hasAttachment: Boolean(file),
    fileName: uploadedFileName,
  })

  return NextResponse.json({ success: true, ticketId: ticket.id })
}
