import type { MessageSender, TicketCategory, TicketStatus } from '@/lib/support'

export type TicketListItem = {
  id: string
  category: TicketCategory
  status: TicketStatus
  subject: string | null
  createdAt: string
  updatedAt: string
  lastMessageAt: string
  projectId: string
  projectName?: string
  businessName?: string
  activationCode?: string
}

export type TicketAttachmentDto = {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string | null
}

export type TicketMessageDto = {
  id: string
  sender: MessageSender
  body: string
  createdAt: string
  attachments: TicketAttachmentDto[]
}
