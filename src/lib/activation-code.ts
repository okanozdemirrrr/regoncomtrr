import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

/** Crockford Base32 — 0/O, 1/I/L karışmaz */
export const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const CODE_BODY_LENGTH = 12
/** 12 × 5 bit = 60 bit entropi */
const REQUIRED_ENTROPY_BITS = CODE_BODY_LENGTH * 5

export type ActivationSecrets = {
  activationPepper: string
  ipHashSalt: string
}

/**
 * Kriptografik rastgele aktivasyon kodu.
 * Format: RGN-XXXX-XXXX-XXXX (Crockford Base32 gövde).
 * Math.random kullanılmaz.
 */
export function generateActivationCode(): string {
  const chars: string[] = []
  while (chars.length < CODE_BODY_LENGTH) {
    const byte = randomBytes(1)[0]
    // 256 % 32 === 0 → bias yok
    if (byte < 256 - (256 % 32)) {
      chars.push(CROCKFORD_BASE32[byte % 32])
    }
  }
  const body = chars.join('')
  return `RGN-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`
}

export function activationCodeEntropyBits(): number {
  return REQUIRED_ENTROPY_BITS
}

/**
 * Büyük harf, boşluk/tire temizliği, karışan karakter eşlemesi.
 */
export function normalizeActivationCode(code: string): string {
  const normalized = code.toUpperCase().replace(/[\s-]/g, '')
  const charMap: Record<string, string> = {
    O: '0',
    I: '1',
    L: '1',
  }
  return normalized
    .split('')
    .map((c) => charMap[c] || c)
    .join('')
}

/**
 * Normalize edilmiş gövde geçerli mi? (RGN + 12 Crockford karakteri)
 * Biçim hatalıysa DB'ye gitmeden reddetmek için.
 */
export function isValidActivationCodeFormat(code: string): boolean {
  const normalized = normalizeActivationCode(code)
  if (!normalized.startsWith('RGN')) return false
  const body = normalized.slice(3)
  if (body.length !== CODE_BODY_LENGTH) return false
  return [...body].every((c) => CROCKFORD_BASE32.includes(c))
}

export function hashActivationCode(code: string, pepper: string): string {
  const normalized = normalizeActivationCode(code)
  return createHmac('sha256', pepper).update(normalized).digest('hex')
}

export function hashIpAddress(ip: string, salt: string): string {
  return createHmac('sha256', salt).update(ip).digest('hex')
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Sabit zamanlı hex karşılaştırma */
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export function getCodeHint(code: string): string {
  const normalized = normalizeActivationCode(code)
  return normalized.slice(-4)
}

// ─── Saf rate-limit / oturum mantığı (test edilebilir) ───

export const RATE_LIMIT = {
  maxFailedAttempts: 5,
  windowMs: 15 * 60 * 1000,
} as const

export const SESSION_TTL = {
  idleMs: 7 * 24 * 60 * 60 * 1000,
  absoluteMs: 30 * 24 * 60 * 60 * 1000,
} as const

export function isIpLocked(
  failedAttemptsInWindow: number,
  maxFailed = RATE_LIMIT.maxFailedAttempts,
): boolean {
  return failedAttemptsInWindow >= maxFailed
}

export type SessionValidityInput = {
  now: number
  revokedAt: string | null
  idleExpiresAt: string
  absoluteExpiresAt: string
  codeStatus: 'active' | 'revoked' | 'expired' | null
  tenantActive: boolean
}

export function isSessionValid(input: SessionValidityInput): boolean {
  if (input.revokedAt) return false
  if (!input.tenantActive) return false
  if (input.codeStatus !== 'active') return false
  if (Date.parse(input.idleExpiresAt) <= input.now) return false
  if (Date.parse(input.absoluteExpiresAt) <= input.now) return false
  return true
}

export function nextIdleExpiry(nowMs: number, absoluteExpiresAt: string): Date {
  const idle = new Date(nowMs + SESSION_TTL.idleMs)
  const absolute = new Date(absoluteExpiresAt)
  return idle < absolute ? idle : absolute
}
