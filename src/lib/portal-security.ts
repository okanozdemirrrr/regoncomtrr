import { NextRequest } from 'next/server'

/**
 * Durum değiştiren isteklerde Origin/Host uyumu (CSRF azaltma).
 * SameSite=Lax cookie ile birlikte kullanılır.
 */
export function assertSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get('host')
  if (!host) return false

  const origin = request.headers.get('origin')
  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  // Form POST bazı tarayıcılarda Origin göndermeyebilir; Referer kontrolü
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      return new URL(referer).host === host
    } catch {
      return false
    }
  }

  // Ne Origin ne Referer: güvenli tarafta reddet (JSON API istemcileri Origin göndermeli)
  return false
}

export function portalCookieName(): string {
  // __Host- yalnızca Secure + Path=/ + Domain yok iken geçerli
  return process.env.NODE_ENV === 'production' ? '__Host-portal_session' : 'portal_session'
}
