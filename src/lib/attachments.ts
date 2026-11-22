import 'server-only'
import { randomBytes } from 'crypto'
import {
  ALLOWED_MIME_TYPES,
  isAllowedMimeType,
  MAX_ATTACHMENT_BYTES,
  SUPPORT_BUCKET,
  type AllowedMimeType,
} from '@/lib/support'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export type UploadedAttachment = {
  storagePath: string
  fileName: string
  fileSize: number
  mimeType: AllowedMimeType
}

export function validateAttachmentFile(file: File): string | null {
  if (!file || file.size <= 0) return 'Dosya boş.'
  if (file.size > MAX_ATTACHMENT_BYTES) return 'Dosya en fazla 10 MB olabilir.'
  if (!isAllowedMimeType(file.type)) {
    return 'Yalnızca PNG, JPG, WEBP veya PDF yüklenebilir.'
  }
  return null
}

export async function uploadSupportAttachment(
  ticketId: string,
  file: File,
): Promise<UploadedAttachment> {
  const error = validateAttachmentFile(file)
  if (error) throw new Error(error)

  const mimeType = file.type as AllowedMimeType
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/jpeg'
        ? 'jpg'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'pdf'

  const safeName = file.name.replace(/[^\w.\-ğüşıöçĞÜŞİÖÇ ]+/gi, '_').slice(0, 120)
  const storagePath = `${ticketId}/${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`

  const supabase = getSupabaseServerClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(SUPPORT_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    throw new Error('Dosya yüklenemedi.')
  }

  return {
    storagePath,
    fileName: safeName || `ek.${ext}`,
    fileSize: file.size,
    mimeType,
  }
}

export async function createAttachmentSignedUrl(
  storagePath: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.storage
    .from(SUPPORT_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export { ALLOWED_MIME_TYPES, MAX_ATTACHMENT_BYTES, SUPPORT_BUCKET }
