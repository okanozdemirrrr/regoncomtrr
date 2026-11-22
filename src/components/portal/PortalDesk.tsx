'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { ChatBubble } from '@/components/support/ChatBubble'
import { MessageComposer } from '@/components/support/MessageComposer'
import {
  categoryLabel,
  statusLabel,
  TICKET_CATEGORIES,
  type TicketCategory,
  type TicketStatus,
} from '@/lib/support'
import { cn } from '@/lib/utils'
import type { TicketListItem, TicketMessageDto } from '@/types/support'

type View = 'list' | 'category' | 'chat'

interface PortalDeskProps {
  businessName: string
  projectName: string
  initialTickets: TicketListItem[]
}

export function PortalDesk({ businessName, projectName, initialTickets }: PortalDeskProps) {
  const [tickets, setTickets] = useState<TicketListItem[]>(initialTickets)
  const [view, setView] = useState<View>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<TicketMessageDto[]>([])
  const [activeMeta, setActiveMeta] = useState<TicketListItem | null>(null)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const loadTickets = useCallback(async () => {
    const res = await fetch('/api/portal/tickets', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { tickets: TicketListItem[] }
    setTickets(data.tickets ?? [])
  }, [])

  const openTicket = useCallback(async (id: string) => {
    setError('')
    const res = await fetch(`/api/portal/tickets/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      setError('Sohbet açılamadı.')
      return
    }
    const data = (await res.json()) as {
      ticket: TicketListItem
      messages: TicketMessageDto[]
    }
    setActiveId(id)
    setActiveMeta(data.ticket)
    setMessages(data.messages)
    setView('chat')
    setMobileListOpen(false)
  }, [])

  // Temiz polling — yeni mesajlar sayfa yenilemeden gelsin
  useEffect(() => {
    if (!activeId || view !== 'chat') return
    const timer = window.setInterval(() => {
      void (async () => {
        const res = await fetch(`/api/portal/tickets/${activeId}/messages`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { messages: TicketMessageDto[] }
        setMessages(data.messages ?? [])
      })()
    }, 3500)
    return () => window.clearInterval(timer)
  }, [activeId, view])

  const startNew = () => {
    setActiveId(null)
    setActiveMeta(null)
    setMessages([])
    setView('category')
    setMobileListOpen(false)
  }

  const createTicket = (category: TicketCategory, body: string, file: File | null) => {
    startTransition(async () => {
      setError('')
      const form = new FormData()
      form.set('category', category)
      form.set('body', body)
      if (file) form.set('file', file)
      const res = await fetch('/api/portal/tickets', { method: 'POST', body: form })
      const data = (await res.json().catch(() => ({}))) as { error?: string; ticketId?: string }
      if (!res.ok || !data.ticketId) {
        setError(data.error || 'Talep açılamadı.')
        return
      }
      await loadTickets()
      await openTicket(data.ticketId)
    })
  }

  const sendMessage = async ({ body, file }: { body: string; file: File | null }) => {
    if (!activeId) return
    const form = new FormData()
    form.set('body', body)
    if (file) form.set('file', file)
    const res = await fetch(`/api/portal/tickets/${activeId}/messages`, {
      method: 'POST',
      body: form,
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      messages?: TicketMessageDto[]
    }
    if (!res.ok) throw new Error(data.error || 'Gönderilemedi.')
    setMessages(data.messages ?? [])
    await loadTickets()
  }

  const statusTone = (status: TicketStatus) => {
    if (status === 'resolved') return 'text-accent-ink'
    if (status === 'reviewing') return 'text-text-primary'
    return 'text-text-secondary'
  }

  const sidebar = useMemo(
    () => (
      <aside className="flex h-full flex-col border-r border-[#1A1612] bg-surface-1">
        <div className="border-b border-[#1A1612] p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
            {'// TALEPLERİM'}
          </p>
          <p className="font-display text-lg font-black text-text-primary truncate">{businessName}</p>
          <p className="font-mono text-[11px] text-text-muted">{projectName}</p>
        </div>
        <div className="p-3">
          <button
            type="button"
            onClick={startNew}
            className="w-full min-h-[44px] border border-[#1A1612] bg-accent font-mono text-[11px] uppercase font-bold text-[#100F0D] hover:bg-accent-hover"
          >
            Yeni talep aç
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto" role="list">
          {tickets.length === 0 ? (
            <li className="px-3 py-6 font-mono text-xs text-text-muted">Henüz talep yok.</li>
          ) : (
            tickets.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => void openTicket(t.id)}
                  className={cn(
                    'w-full border-b border-[#1A1612]/15 px-3 py-3 text-left hover:bg-surface-paper',
                    activeId === t.id && 'bg-surface-paper',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {categoryLabel(t.category)}
                    </span>
                    {t.category === 'crash' ? (
                      <span className="shrink-0 border border-red-800 bg-red-100 px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-red-900">
                        Acil
                      </span>
                    ) : null}
                  </div>
                  <p className={cn('mt-1 font-mono text-[10px] uppercase', statusTone(t.status))}>
                    {statusLabel(t.status)}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
        <form action="/api/portal/logout" method="POST" className="border-t border-[#1A1612] p-3">
          <button
            type="submit"
            className="w-full min-h-[40px] border border-[#1A1612] bg-surface-paper font-mono text-[11px] uppercase font-bold text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3]"
          >
            Çıkış
          </button>
        </form>
      </aside>
    ),
    [activeId, businessName, openTicket, projectName, tickets],
  )

  return (
    <div className="flex h-[100dvh] flex-col bg-background md:flex-row">
      <div className="flex items-center justify-between border-b border-[#1A1612] bg-surface-paper px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileListOpen((v) => !v)}
          className="min-h-[40px] border border-[#1A1612] px-3 font-mono text-[11px] uppercase font-bold"
        >
          Talepler
        </button>
        <span className="font-display text-sm font-black">Destek</span>
        <button
          type="button"
          onClick={startNew}
          className="min-h-[40px] border border-[#1A1612] bg-accent px-3 font-mono text-[11px] uppercase font-bold"
        >
          Yeni
        </button>
      </div>

      <div
        className={cn(
          'w-full md:w-72 md:shrink-0',
          mobileListOpen ? 'block' : 'hidden md:block',
          'h-[40vh] md:h-full',
        )}
      >
        {sidebar}
      </div>

      <section className="flex min-h-0 flex-1 flex-col bg-background">
        {error ? (
          <p role="alert" className="border-b border-[#1A1612]/20 bg-surface-paper px-4 py-2 font-mono text-xs">
            {error}
          </p>
        ) : null}

        {view === 'list' && !activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
              {'// OPERASYON MASASI'}
            </p>
            <h1 className="font-display text-2xl font-black text-text-primary">Destek sohbeti</h1>
            <p className="max-w-sm font-mono text-xs text-text-secondary">
              Soldan eski taleplerinizi açın veya yeni bir talep başlatın. Karmaşık form yok — yazın,
              dosya ekleyin, gönderin.
            </p>
            <button
              type="button"
              onClick={startNew}
              className="mt-2 min-h-[44px] border border-[#1A1612] bg-accent px-6 font-mono text-xs uppercase font-bold"
            >
              Yeni talep aç
            </button>
          </div>
        ) : null}

        {view === 'category' ? (
          <div className="flex flex-1 flex-col p-4 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink mb-2">
              {'// KATEGORİ SEÇ'}
            </p>
            <h2 className="font-display text-2xl font-black text-text-primary mb-6">
              Ne hakkında yazmak istiyorsunuz?
            </h2>
            <div className="grid gap-3 max-w-xl">
              {TICKET_CATEGORIES.map((cat) => (
                <CategoryStartCard
                  key={cat.id}
                  category={cat.id}
                  label={cat.label}
                  description={cat.description}
                  urgent={cat.urgent}
                  disabled={pending}
                  onStart={(body, file) => createTicket(cat.id, body, file)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {view === 'chat' && activeMeta ? (
          <>
            <header className="flex items-center justify-between gap-3 border-b border-[#1A1612] bg-surface-paper px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-black text-text-primary">
                    {categoryLabel(activeMeta.category)}
                  </h2>
                  {activeMeta.category === 'crash' ? (
                    <span className="border border-red-800 bg-red-100 px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-red-900">
                      Acil
                    </span>
                  ) : null}
                </div>
                <p className={cn('font-mono text-[11px] uppercase', statusTone(activeMeta.status))}>
                  {statusLabel(activeMeta.status)}
                </p>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" data-lenis-prevent>
              {messages.map((m) => (
                <ChatBubble
                  key={m.id}
                  message={m}
                  align={m.sender === 'customer' ? 'right' : 'left'}
                />
              ))}
            </div>
            <MessageComposer onSend={sendMessage} />
          </>
        ) : null}
      </section>
    </div>
  )
}

function CategoryStartCard({
  category,
  label,
  description,
  urgent,
  disabled,
  onStart,
}: {
  category: TicketCategory
  label: string
  description: string
  urgent?: boolean
  disabled?: boolean
  onStart: (body: string, file: File | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full border border-[#1A1612] bg-surface-paper p-4 text-left hover:bg-accent-soft transition-colors',
          urgent && 'border-red-800',
        )}
      >
        <p className={cn('font-mono text-sm font-bold', urgent ? 'text-red-900' : 'text-text-primary')}>
          {label}
        </p>
        <p className="mt-1 font-mono text-[11px] text-text-secondary">{description}</p>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'border border-[#1A1612] bg-surface-paper p-4 space-y-3',
        urgent && 'border-red-800',
      )}
    >
      <p className={cn('font-mono text-sm font-bold', urgent ? 'text-red-900' : 'text-text-primary')}>
        {label}
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Kısaca ne oldu / ne istiyorsunuz?"
        className="w-full border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 text-sm focus:outline-none focus:border-accent"
        disabled={disabled}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={disabled}
          className="hidden"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="min-h-[40px] border border-[#1A1612] bg-surface-1 px-4 font-mono text-[11px] uppercase font-bold text-text-primary hover:bg-surface-2 disabled:opacity-50"
        >
          Dosya ekle
        </button>
        {file ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 border border-[#1A1612]/20 bg-surface-1 px-2 py-1.5">
            <span className="truncate font-mono text-[11px] text-text-primary">{file.name}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setFile(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
              className="shrink-0 font-mono text-[10px] uppercase text-text-muted hover:text-text-primary"
            >
              Kaldır
            </button>
          </div>
        ) : (
          <span className="font-mono text-[10px] text-text-muted">PNG, JPG, WEBP, PDF · max 10 MB</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || !body.trim()}
          onClick={() => onStart(body.trim(), file)}
          className="min-h-[40px] border border-[#1A1612] bg-accent px-4 font-mono text-[11px] uppercase font-bold disabled:opacity-50"
        >
          Sohbeti başlat
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(false)}
          className="min-h-[40px] border border-[#1A1612] px-4 font-mono text-[11px] uppercase"
        >
          Vazgeç
        </button>
      </div>
      <span className="sr-only">{category}</span>
    </div>
  )
}
