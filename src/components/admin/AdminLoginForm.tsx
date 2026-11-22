'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminLoginForm() {
  const inputId = useId()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Giriş başarısız.')
        return
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-sm w-full">
      <div>
        <label htmlFor={inputId} className="block font-mono text-xs uppercase font-bold mb-2">
          Yönetici şifresi
        </label>
        <input
          id={inputId}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          required
          className="w-full min-h-[44px] border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
      </div>
      {error ? (
        <p role="alert" className="font-mono text-xs text-red-900 border border-red-800/40 px-3 py-2">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !password}
        className={cn(
          'w-full min-h-[44px] border border-[#1A1612] bg-[#1A1612] font-mono text-xs uppercase font-bold text-[#FAF8F3]',
          'hover:bg-accent hover:text-[#100F0D] disabled:opacity-50',
        )}
      >
        {pending ? 'Kontrol…' : 'Giriş'}
      </button>
    </form>
  )
}
