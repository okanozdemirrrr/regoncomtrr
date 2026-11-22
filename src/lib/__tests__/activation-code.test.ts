import { describe, it, expect } from 'vitest'
import {
  CODE_LETTERS,
  generateActivationCode,
  generateSessionToken,
  hashActivationCode,
  hashIpAddress,
  hashSessionToken,
  isIpLocked,
  isSessionValid,
  isValidActivationCodeFormat,
  nextIdleExpiry,
  normalizeActivationCode,
  safeEqualHex,
  SESSION_TTL,
} from '../activation-code'

const PEPPER = 'test-activation-pepper-min-32-chars!!'
const SALT = 'test-ip-hash-salt-min-32-characters!!'

describe('Activation Code System (3 harf + 3 rakam)', () => {
  describe('generateActivationCode', () => {
    it('formats AAA999 with allowed letters only', () => {
      for (let i = 0; i < 30; i++) {
        const code = generateActivationCode()
        expect(code).toMatch(/^[A-Z]{3}[0-9]{3}$/)
        expect(code).not.toMatch(/[OI]/)
        for (const c of code.slice(0, 3)) {
          expect(CODE_LETTERS.includes(c)).toBe(true)
        }
      }
    })

    it('produces unique codes often', () => {
      const set = new Set(Array.from({ length: 40 }, () => generateActivationCode()))
      expect(set.size).toBeGreaterThan(30)
    })
  })

  describe('normalizeActivationCode', () => {
    it('uppercases and strips separators', () => {
      expect(normalizeActivationCode('rgn 104')).toBe('RGN104')
      expect(normalizeActivationCode('doy-552')).toBe('DOY552')
    })
  })

  describe('isValidActivationCodeFormat', () => {
    it('accepts generated codes', () => {
      expect(isValidActivationCodeFormat(generateActivationCode())).toBe(true)
      expect(isValidActivationCodeFormat('RGN104')).toBe(true)
    })

    it('rejects invalid shapes', () => {
      expect(isValidActivationCodeFormat('RGN10')).toBe(false)
      expect(isValidActivationCodeFormat('RG1044')).toBe(false)
      expect(isValidActivationCodeFormat('123ABC')).toBe(false)
      expect(isValidActivationCodeFormat('not-a-code')).toBe(false)
    })
  })

  describe('hashActivationCode', () => {
    it('is stable and case/format insensitive', () => {
      const a = hashActivationCode('RGN104', PEPPER)
      const b = hashActivationCode('rgn 104', PEPPER)
      expect(a).toBe(b)
      expect(a).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('hashIpAddress / session tokens', () => {
    it('hashes IP stably', () => {
      expect(hashIpAddress('1.2.3.4', SALT)).toBe(hashIpAddress('1.2.3.4', SALT))
      expect(hashIpAddress('1.2.3.4', SALT)).not.toBe(hashIpAddress('1.2.3.5', SALT))
    })

    it('session token is 64 hex chars', () => {
      const t = generateSessionToken()
      expect(t).toMatch(/^[a-f0-9]{64}$/)
      expect(hashSessionToken(t)).toMatch(/^[a-f0-9]{64}$/)
    })

    it('safeEqualHex works', () => {
      const h = hashSessionToken('abc')
      expect(safeEqualHex(h, h)).toBe(true)
      expect(safeEqualHex(h, hashSessionToken('xyz'))).toBe(false)
    })
  })

  describe('rate limit / session validity', () => {
    it('locks after 5 failures', () => {
      expect(isIpLocked(4)).toBe(false)
      expect(isIpLocked(5)).toBe(true)
    })

    it('rejects revoked, expired idle, absolute, inactive code', () => {
      const base = {
        now: Date.parse('2026-01-15T12:00:00Z'),
        revokedAt: null as string | null,
        idleExpiresAt: '2026-01-20T12:00:00Z',
        absoluteExpiresAt: '2026-02-10T12:00:00Z',
        codeStatus: 'active' as const,
      }
      expect(isSessionValid(base)).toBe(true)
      expect(isSessionValid({ ...base, revokedAt: '2026-01-14T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, idleExpiresAt: '2026-01-01T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, absoluteExpiresAt: '2026-01-01T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, codeStatus: 'inactive' })).toBe(false)
    })

    it('caps idle renewal at absolute expiry', () => {
      const now = Date.parse('2026-02-01T00:00:00Z')
      const absolute = '2026-02-02T00:00:00Z'
      const next = nextIdleExpiry(now, absolute)
      expect(next.toISOString()).toBe(new Date(absolute).toISOString())
      expect(SESSION_TTL.idleMs).toBe(7 * 86400000)
      expect(SESSION_TTL.absoluteMs).toBe(30 * 86400000)
    })
  })
})
