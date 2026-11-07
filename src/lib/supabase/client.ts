/**
 * Tarayıcı tarafı Supabase istemcisi — Aşama 4'te kullanılmaz.
 * Portal verisi yalnızca sunucu (service role) üzerinden okunur.
 * Bu dosya bilinçli olarak boş bırakıldı; yanlışlıkla client tablo
 * erişimi eklenmesin diye export yok.
 */

export function getSupabaseBrowserClient(): never {
  throw new Error(
    'İstemci tarafında Supabase tablo erişimi yok. Portal işlemleri sunucu üzerinden yapılır.',
  )
}
