'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function formatActivationInput(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const letters = upper.replace(/[^A-Z]/g, '').slice(0, 3)
  const digits = upper.slice(letters.length).replace(/[^0-9]/g, '').slice(0, 3)
  // Kullanıcı harf/rakam karışık yazarsa sırayı koru
  const cleaned = upper.slice(0, 6)
  if (/^[A-Z]{0,3}[0-9]{0,3}$/.test(cleaned) && cleaned.length <= 6) {
    const l = cleaned.replace(/[0-9]/g, '').slice(0, 3)
    const d = cleaned.replace(/[A-Z]/g, '').slice(0, 3)
    return `${l}${d}`
  }
  return `${letters}${digits}`
}

interface PortalLoginFormProps {
  initialError?: string
}

export function PortalLoginForm({ initialError }: PortalLoginFormProps) {
  const inputId = useId()
  const errorId = useId()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState(initialError ?? '')
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ code }),
        })
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          setError(data.error || 'Giriş hatası. Lütfen daha sonra tekrar deneyin.')
          return
        }
        router.replace('/portal')
        router.refresh()
      } catch {
        setError('Giriş hatası. Lütfen daha sonra tekrar deneyin.')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor={inputId}
          className="block font-mono text-xs uppercase font-bold text-text-primary mb-2"
        >
          Aktivasyon kodunu gir
        </label>
        <input
          id={inputId}
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="RGN104"
          value={code}
          onChange={(e) => setCode(formatActivationInput(e.target.value))}
          onPaste={(e) => {
            e.preventDefault()
            setCode(formatActivationInput(e.clipboardData.getData('text')))
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={pending}
          required
          maxLength={6}
          className={cn(
            'w-full border border-[#1A1612] bg-[#FAF8F3] px-4 py-3 font-mono text-2xl tracking-[0.2em] text-text-primary text-center',
            'placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
            'uppercase min-h-[52px] disabled:opacity-60',
          )}
        />
        <p className="font-mono text-[10px] text-text-muted mt-2 text-center">
          Format: 3 harf + 3 rakam (örn. RGN104)
        </p>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="border border-[#1A1612]/30 bg-[#FAF8F3] px-4 py-3 font-mono text-xs text-text-primary"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || code.length !== 6}
        className={cn(
          'w-full min-h-[44px] h-12 border border-[#1A1612] bg-accent font-mono text-xs uppercase font-bold',
          'text-[#100F0D] hover:bg-accent-hover transition-colors',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {pending ? 'Kontrol ediliyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
