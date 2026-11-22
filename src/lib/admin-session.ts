import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Proxy ve route handler'ların paylaştığı admin oturum doğrulaması.
 * 'server-only' yok — src/proxy.ts buradan import eder.
 */

export const ADMIN_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session'

export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000

function signPayload(payload: string, adminPassword: string, pepper: string): string {
  return createHmac('sha256', `${adminPassword}:${pepper}`).update(payload).digest('hex')
}

export function createAdminSessionToken(
  adminPassword: string,
  pepper: string,
  now: number,
): string {
  const expiresAt = now + ADMIN_SESSION_TTL_MS
  const payload = `admin:${expiresAt}`
  const sig = signPayload(payload, adminPassword, pepper)
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyAdminSessionTokenWithSecret(
  token: string | undefined | null,
  adminPassword: string,
  pepper: string,
  now: number,
): boolean {
  if (!token || !adminPassword || !pepper) return false
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return false
  try {
    const payload = Buffer.from(encoded, 'base64url').toString('utf8')
    const expected = signPayload(payload, adminPassword, pepper)
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false
    const [, expiresRaw] = payload.split(':')
    const expiresAt = Number(expiresRaw)
    if (!Number.isFinite(expiresAt) || expiresAt <= now) return false
    return true
  } catch {
    return false
  }
}
