'use client'

import { useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  onSend: (payload: { body: string; file: File | null }) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function MessageComposer({
  onSend,
  disabled,
  placeholder = 'Mesajınızı yazın…',
}: MessageComposerProps) {
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    if ((!body.trim() && !file) || pending || disabled) return
    setError('')
    const payload = { body: body.trim(), file }
    startTransition(async () => {
      try {
        await onSend(payload)
        setBody('')
        setFile(null)
        if (fileRef.current) fileRef.current.value = ''
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gönderilemedi.')
      }
    })
  }

  return (
    <div className="border-t border-[#1A1612] bg-surface-paper p-3 space-y-2">
      {file ? (
        <div className="flex items-center justify-between gap-2 border border-[#1A1612]/20 bg-surface-1 px-2 py-1.5">
          <span className="font-mono text-[11px] text-text-primary truncate">{file.name}</span>
          <button
            type="button"
            className="font-mono text-[10px] uppercase text-text-muted hover:text-text-primary"
            onClick={() => {
              setFile(null)
              if (fileRef.current) fileRef.current.value = ''
            }}
          >
            Kaldır
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="font-mono text-[11px] text-red-800">
          {error}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <label className="shrink-0">
          <span className="sr-only">Dosya ekle</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={pending || disabled}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending || disabled}
            className="min-h-[44px] border border-[#1A1612] bg-surface-1 px-3 font-mono text-[11px] uppercase font-bold text-text-primary hover:bg-surface-2 disabled:opacity-50"
          >
            Dosya
          </button>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={2}
          placeholder={placeholder}
          disabled={pending || disabled}
          className={cn(
            'flex-1 resize-none border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 text-sm text-text-primary',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 disabled:opacity-60',
          )}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || disabled || (!body.trim() && !file)}
          className="min-h-[44px] border border-[#1A1612] bg-accent px-4 font-mono text-[11px] uppercase font-bold text-[#100F0D] hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? '…' : 'Gönder'}
        </button>
      </div>
      <p className="font-mono text-[10px] text-text-muted">PNG, JPG, WEBP, PDF · max 10 MB</p>
    </div>
  )
}
