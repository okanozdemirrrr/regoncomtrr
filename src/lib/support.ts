export type TicketCategory = 'bug' | 'crash' | 'paid_revision'
export type TicketStatus = 'pending' | 'reviewing' | 'resolved'
export type MessageSender = 'customer' | 'admin'

export const TICKET_CATEGORIES: {
  id: TicketCategory
  label: string
  description: string
  urgent?: boolean
}[] = [
  {
    id: 'bug',
    label: 'Hata Bildirimi',
    description: 'Standart yazılım hatası',
  },
  {
    id: 'crash',
    label: 'Çökme Bildirimi (Acil Durum)',
    description: 'Sistem durduysa — yüksek öncelik',
    urgent: true,
  },
  {
    id: 'paid_revision',
    label: 'Ücretli Revizyon İsteği',
    description: 'Yeni özellik veya özel değişiklik',
  },
]

export const TICKET_STATUSES: {
  id: TicketStatus
  label: string
}[] = [
  { id: 'pending', label: 'Beklemede' },
  { id: 'reviewing', label: 'İnceleniyor' },
  { id: 'resolved', label: 'Çözüldü' },
]

export const SUPPORT_BUCKET = 'support-attachments'
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

export function categoryLabel(category: TicketCategory): string {
  return TICKET_CATEGORIES.find((c) => c.id === category)?.label ?? category
}

export function statusLabel(status: TicketStatus): string {
  return TICKET_STATUSES.find((s) => s.id === status)?.label ?? status
}

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith('image/')
}
