import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

/** Aktivasyon kodu harf seti — O/I karışmasın diye hariç */
export const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
export const CODE_DIGITS = '0123456789'

export type ActivationSecrets = {
  activationPepper: string
  ipHashSalt: string
}

/**
 * Kriptografik rastgele aktivasyon kodu.
 * Format: 3 harf + 3 rakam (örn. RGN104, DOY552).
 */
export function generateActivationCode(): string {
  const letters: string[] = []
  while (letters.length < 3) {
    const byte = randomBytes(1)[0]
    if (byte < 256 - (256 % CODE_LETTERS.length)) {
      letters.push(CODE_LETTERS[byte % CODE_LETTERS.length])
    }
  }
  const digits: string[] = []
  while (digits.length < 3) {
    const byte = randomBytes(1)[0]
    if (byte < 256 - (256 % CODE_DIGITS.length)) {
      digits.push(CODE_DIGITS[byte % CODE_DIGITS.length])
    }
  }
  return `${letters.join('')}${digits.join('')}`
}

/**
 * Büyük/küçük harf duyarsız; boşluk ve tire temizlenir.
 */
export function normalizeActivationCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, '')
}

/**
 * Geçerli biçim: tam olarak 3 harf + 3 rakam.
 */
export function isValidActivationCodeFormat(code: string): boolean {
  const normalized = normalizeActivationCode(code)
  return /^[A-Z]{3}[0-9]{3}$/.test(normalized)
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

export function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// ─── Rate-limit / oturum ───

export const RATE_LIMIT = {
  maxFailedAttempts: 5,
  /** 5 hatalı denemeden sonra kısa bekleme penceresi */
  windowMs: 2 * 60 * 1000,
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
  codeStatus: 'active' | 'inactive' | null
}

export function isSessionValid(input: SessionValidityInput): boolean {
  if (input.revokedAt) return false
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
