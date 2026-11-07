import { describe, it, expect } from 'vitest'
import {
  CROCKFORD_BASE32,
  activationCodeEntropyBits,
  generateActivationCode,
  generateSessionToken,
  getCodeHint,
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

describe('Activation Code System', () => {
  describe('generateActivationCode', () => {
    it('formats RGN-XXXX-XXXX-XXXX with Crockford chars only', () => {
      for (let i = 0; i < 20; i++) {
        const code = generateActivationCode()
        expect(code).toMatch(/^RGN-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/)
        expect(code).not.toMatch(/[OIL]/)
        const body = code.replace(/RGN-|- /g, '').replace(/-/g, '')
        for (const c of body) {
          expect(CROCKFORD_BASE32.includes(c)).toBe(true)
        }
      }
    })

    it('produces unique codes', () => {
      const set = new Set(Array.from({ length: 30 }, () => generateActivationCode()))
      expect(set.size).toBe(30)
    })

    it('has at least 60 bits of entropy in body', () => {
      expect(activationCodeEntropyBits()).toBeGreaterThanOrEqual(60)
    })
  })

  describe('normalizeActivationCode', () => {
    it('uppercases and strips separators', () => {
      expect(normalizeActivationCode('rgn-ab12-cd34-ef56')).toBe('RGNAB12CD34EF56')
    })

    it('maps O→0 and I/L→1', () => {
      expect(normalizeActivationCode('RGN-ABOC-DEF1-GHLX')).toBe('RGNAB0CDEF1GH1X')
    })
  })

  describe('isValidActivationCodeFormat', () => {
    it('accepts generated codes', () => {
      expect(isValidActivationCodeFormat(generateActivationCode())).toBe(true)
    })

    it('rejects short or invalid charset before DB', () => {
      expect(isValidActivationCodeFormat('RGN-AAAA')).toBe(false)
      // U Crockford setinde yok
      expect(isValidActivationCodeFormat('RGN-UUUU-UUUU-UUUU')).toBe(false)
      expect(isValidActivationCodeFormat('not-a-code')).toBe(false)
    })
  })

  describe('hashActivationCode', () => {
    it('is stable and case/format insensitive', () => {
      const a = hashActivationCode('RGN-AB12-CD34-EF56', PEPPER)
      const b = hashActivationCode('rgn ab12 cd34 ef56', PEPPER)
      expect(a).toBe(b)
      expect(a).toMatch(/^[a-f0-9]{64}$/)
    })

    it('differs for different codes', () => {
      expect(hashActivationCode('RGN-AB12-CD34-EF56', PEPPER)).not.toBe(
        hashActivationCode('RGN-AB12-CD34-EF57', PEPPER),
      )
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

  describe('getCodeHint', () => {
    it('returns last 4 of normalized code', () => {
      expect(getCodeHint('RGN-AB12-CD34-EF56')).toBe('EF56')
    })
  })

  describe('rate limit / session validity', () => {
    it('locks after 5 failures', () => {
      expect(isIpLocked(4)).toBe(false)
      expect(isIpLocked(5)).toBe(true)
    })

    it('rejects revoked, expired idle, absolute, inactive tenant, inactive code', () => {
      const base = {
        now: Date.parse('2026-01-15T12:00:00Z'),
        revokedAt: null as string | null,
        idleExpiresAt: '2026-01-20T12:00:00Z',
        absoluteExpiresAt: '2026-02-10T12:00:00Z',
        codeStatus: 'active' as const,
        tenantActive: true,
      }
      expect(isSessionValid(base)).toBe(true)
      expect(isSessionValid({ ...base, revokedAt: '2026-01-14T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, idleExpiresAt: '2026-01-01T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, absoluteExpiresAt: '2026-01-01T00:00:00Z' })).toBe(false)
      expect(isSessionValid({ ...base, tenantActive: false })).toBe(false)
      expect(isSessionValid({ ...base, codeStatus: 'revoked' })).toBe(false)
      expect(isSessionValid({ ...base, codeStatus: 'expired' })).toBe(false)
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
