import 'server-only'
import { categoryLabel, type TicketCategory } from '@/lib/support'

export type TelegramNotificationInput = {
  kind: 'new_ticket' | 'new_message'
  businessName: string
  projectName: string
  category: TicketCategory
  body: string
  hasAttachment?: boolean
  fileName?: string | null
}

/**
 * Müşteri portalı olaylarını Telegram'a bildirir.
 * Env eksik veya API hata verse bile asla throw etmez — çağıran akışı bozmaz.
 */
export async function sendTelegramNotification(
  input: TelegramNotificationInput,
): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
    if (!token || !chatId) {
      console.warn('[telegram] TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID eksik; bildirim atlandı.')
      return
    }

    const isCrash = input.category === 'crash'
    const icon = isCrash ? '🚨' : '🔔'
    const title =
      input.kind === 'new_ticket' ? `${icon} Yeni talep` : `${icon} Yeni mesaj`
    const category = categoryLabel(input.category)
    const messageBody = input.body.trim() || '(boş mesaj)'
    const attachmentLine = input.hasAttachment
      ? `\n📎 Dosya eklendi${input.fileName ? `: ${input.fileName}` : ''}`
      : ''

    const text = [
      title,
      '',
      `İşletme: ${input.businessName}`,
      `Proje: ${input.projectName}`,
      `Kategori: ${category}`,
      `Mesaj: ${messageBody}${attachmentLine}`,
      '',
      'https://regon.com.tr/admin',
    ].join('\n')

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[telegram] sendMessage başarısız', res.status, detail.slice(0, 200))
    }
  } catch (err) {
    console.error('[telegram] bildirim gönderilemedi', err)
  }
}
