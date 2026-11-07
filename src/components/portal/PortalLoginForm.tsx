'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function formatActivationInput(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let body = upper.startsWith('RGN') ? upper.slice(3) : upper
  body = body.slice(0, 12)
  const parts = [body.slice(0, 4), body.slice(4, 8), body.slice(8, 12)].filter(Boolean)
  if (parts.length === 0) return upper.startsWith('RGN') ? 'RGN-' : ''
  return `RGN-${parts.join('-')}`
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
          placeholder="RGN-XXXX-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(formatActivationInput(e.target.value))}
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData('text')
            setCode(formatActivationInput(text))
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={pending}
          required
          className={cn(
            'w-full border-2 border-[#1A1612] bg-[#FAF8F3] px-4 py-3 font-mono text-sm text-text-primary',
            'placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
            'uppercase min-h-[44px] disabled:opacity-60',
          )}
        />
        <p className="font-mono text-[10px] text-text-muted mt-1">Format: RGN-XXXX-XXXX-XXXX</p>
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
        disabled={pending || code.length < 16}
        className={cn(
          'w-full min-h-[44px] h-12 border-2 border-[#1A1612] bg-accent font-mono text-xs uppercase font-bold',
          'text-[#100F0D] hover:bg-accent-hover transition-colors shadow-[2px_2px_0px_#1A1612]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {pending ? 'Kontrol ediliyor…' : 'Giriş Yap'}
      </button>
    </form>
  )
}
