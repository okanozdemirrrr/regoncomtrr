'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChatBubble } from '@/components/support/ChatBubble'
import { MessageComposer } from '@/components/support/MessageComposer'
import {
  categoryLabel,
  statusLabel,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketStatus,
} from '@/lib/support'
import { cn } from '@/lib/utils'
import type { TicketListItem, TicketMessageDto } from '@/types/support'

type Tab = 'tickets' | 'codes'
type Project = { id: string; slug: string; name: string; status: string }
type CodeRow = {
  id: string
  code: string
  project_id: string
  business_name: string
  status: 'active' | 'inactive'
  note: string | null
  created_at: string
  last_used_at: string | null
  projectName: string | null
}

interface AdminDashboardProps {
  initialProjects: Project[]
  initialTickets: TicketListItem[]
  initialCodes: CodeRow[]
}

export function AdminDashboard({
  initialProjects,
  initialTickets,
  initialCodes,
}: AdminDashboardProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('tickets')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [tickets, setTickets] = useState<TicketListItem[]>(initialTickets)
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes)
  const [filterCategory, setFilterCategory] = useState<TicketCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTicket, setActiveTicket] = useState<TicketListItem | null>(null)
  const [messages, setMessages] = useState<TicketMessageDto[]>([])
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/admin/projects', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { projects: Project[] }
    setProjects(data.projects ?? [])
  }, [])

  const loadTickets = useCallback(
    async (category = filterCategory, status = filterStatus, projectId = filterProject) => {
      const qs = new URLSearchParams({ category, status, projectId })
      const res = await fetch(`/api/admin/tickets?${qs}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { tickets: TicketListItem[] }
      setTickets(data.tickets ?? [])
    },
    [filterCategory, filterProject, filterStatus],
  )

  const loadCodes = useCallback(async () => {
    const res = await fetch('/api/admin/activation-codes', { cache: 'no-store' })
    if (!res.ok) return
    const data = (await res.json()) as { codes: CodeRow[] }
    setCodes(data.codes ?? [])
  }, [])

  const openTicket = async (id: string) => {
    setError('')
    const res = await fetch(`/api/admin/tickets/${id}`, { cache: 'no-store' })
    if (!res.ok) {
      setError('Sohbet açılamadı.')
      return
    }
    const data = (await res.json()) as { ticket: TicketListItem; messages: TicketMessageDto[] }
    setActiveId(id)
    setActiveTicket(data.ticket)
    setMessages(data.messages)
  }

  useEffect(() => {
    if (!activeId || tab !== 'tickets') return
    const timer = window.setInterval(() => {
      void (async () => {
        const res = await fetch(`/api/admin/tickets/${activeId}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { ticket: TicketListItem; messages: TicketMessageDto[] }
        setActiveTicket(data.ticket)
        setMessages(data.messages)
      })()
    }, 3500)
    return () => window.clearInterval(timer)
  }, [activeId, tab])

  const sendMessage = async ({ body, file }: { body: string; file: File | null }) => {
    if (!activeId) return
    const form = new FormData()
    form.set('body', body)
    if (file) form.set('file', file)
    const res = await fetch(`/api/admin/tickets/${activeId}/messages`, { method: 'POST', body: form })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      messages?: TicketMessageDto[]
    }
    if (!res.ok) throw new Error(data.error || 'Gönderilemedi.')
    setMessages(data.messages ?? [])
    await loadTickets()
  }

  const updateStatus = (status: TicketStatus) => {
    if (!activeId) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/tickets/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        setError('Durum güncellenemedi.')
        return
      }
      setActiveTicket((prev) => (prev ? { ...prev, status } : prev))
      await loadTickets()
    })
  }

  const applyFilters = (
    category: TicketCategory | 'all',
    status: TicketStatus | 'all',
    projectId: string,
  ) => {
    setFilterCategory(category)
    setFilterStatus(status)
    setFilterProject(projectId)
    void loadTickets(category, status, projectId)
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-[#1A1612] bg-surface-paper px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
            {'// GİZLİ YÖNETİM'}
          </p>
          <h1 className="font-display text-xl font-black">Operasyon Masası</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTab('tickets')
              void loadTickets()
            }}
            className={cn(
              'min-h-[40px] border border-[#1A1612] px-3 font-mono text-[11px] uppercase font-bold',
              tab === 'tickets' ? 'bg-accent' : 'bg-surface-1',
            )}
          >
            Gelen Talepler
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('codes')
              void loadCodes()
              void loadProjects()
            }}
            className={cn(
              'min-h-[40px] border border-[#1A1612] px-3 font-mono text-[11px] uppercase font-bold',
              tab === 'codes' ? 'bg-accent' : 'bg-surface-1',
            )}
          >
            Projeler & Kodlar
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="min-h-[40px] border border-[#1A1612] px-3 font-mono text-[11px] uppercase font-bold hover:bg-[#1A1612] hover:text-[#FAF8F3]"
          >
            Çıkış
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="border-b border-[#1A1612]/20 px-4 py-2 font-mono text-xs">
          {error}
        </p>
      ) : null}

      {tab === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100dvh-57px)]">
          <div className="lg:col-span-4 border-r border-[#1A1612] bg-surface-1 flex flex-col">
            <div className="border-b border-[#1A1612]/20 p-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <select
                value={filterCategory}
                onChange={(e) =>
                  applyFilters(e.target.value as TicketCategory | 'all', filterStatus, filterProject)
                }
                className="border border-[#1A1612] bg-surface-paper px-2 py-2 font-mono text-[11px]"
              >
                <option value="all">Tüm kategoriler</option>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) =>
                  applyFilters(filterCategory, e.target.value as TicketStatus | 'all', filterProject)
                }
                className="border border-[#1A1612] bg-surface-paper px-2 py-2 font-mono text-[11px]"
              >
                <option value="all">Tüm durumlar</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={filterProject}
                onChange={(e) => applyFilters(filterCategory, filterStatus, e.target.value)}
                className="border border-[#1A1612] bg-surface-paper px-2 py-2 font-mono text-[11px]"
              >
                <option value="all">Tüm projeler</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <ul className="flex-1 overflow-y-auto" role="list">
              {tickets.map((t) => (
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
                      <span className="font-mono text-xs font-bold">{categoryLabel(t.category)}</span>
                      {t.category === 'crash' ? (
                        <span className="border border-red-800 bg-red-100 px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold text-red-900">
                          Acil
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-text-secondary truncate">
                      {t.businessName} · {t.projectName} · {t.activationCode}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-text-muted">
                      {statusLabel(t.status)}
                    </p>
                  </button>
                </li>
              ))}
              {tickets.length === 0 ? (
                <li className="p-4 font-mono text-xs text-text-muted">Talep yok.</li>
              ) : null}
            </ul>
          </div>

          <div className="lg:col-span-8 flex flex-col min-h-[50vh]">
            {!activeTicket ? (
              <div className="flex flex-1 items-center justify-center p-8 font-mono text-xs text-text-muted">
                Soldan bir sohbet seçin.
              </div>
            ) : (
              <>
                <div className="border-b border-[#1A1612] bg-surface-paper px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-black">
                      {categoryLabel(activeTicket.category)}
                    </h2>
                    <p className="font-mono text-[11px] text-text-secondary">
                      {activeTicket.businessName} · {activeTicket.projectName} ·{' '}
                      {activeTicket.activationCode}
                    </p>
                  </div>
                  <select
                    value={activeTicket.status}
                    disabled={pending}
                    onChange={(e) => updateStatus(e.target.value as TicketStatus)}
                    className="border border-[#1A1612] bg-surface-1 px-2 py-2 font-mono text-[11px]"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4" data-lenis-prevent>
                  {messages.map((m) => (
                    <ChatBubble
                      key={m.id}
                      message={m}
                      align={m.sender === 'admin' ? 'right' : 'left'}
                    />
                  ))}
                </div>
                <MessageComposer onSend={sendMessage} placeholder="Müşteriye yanıt yazın…" />
              </>
            )}
          </div>
        </div>
      ) : (
        <CodesPanel
          projects={projects}
          codes={codes}
          onRefresh={async () => {
            await loadProjects()
            await loadCodes()
          }}
        />
      )}
    </div>
  )
}

function CodesPanel({
  projects,
  codes,
  onRefresh,
}: {
  projects: Project[]
  codes: CodeRow[]
  onRefresh: () => Promise<void>
}) {
  const [projectName, setProjectName] = useState('')
  const [projectSlug, setProjectSlug] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [manualCode, setManualCode] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const selectedProjectId = projectId || projects[0]?.id || ''

  const createProject = () => {
    startTransition(async () => {
      setMessage('')
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, slug: projectSlug }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setMessage(data.error || 'Proje oluşturulamadı.')
        return
      }
      setProjectName('')
      setProjectSlug('')
      setMessage('Proje eklendi.')
      await onRefresh()
    })
  }

  const generateCode = async () => {
    const res = await fetch('/api/admin/generate-code')
    const data = (await res.json()) as { code?: string }
    if (data.code) setManualCode(data.code)
  }

  const createCode = () => {
    startTransition(async () => {
      setMessage('')
      const res = await fetch('/api/admin/activation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          businessName,
          code: manualCode || undefined,
          note: note || null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        code?: { code: string }
      }
      if (!res.ok) {
        setMessage(data.error || 'Kod oluşturulamadı.')
        return
      }
      setMessage(`Kod oluşturuldu: ${data.code?.code}`)
      setBusinessName('')
      setManualCode('')
      setNote('')
      await onRefresh()
    })
  }

  const toggleCode = (id: string, status: 'active' | 'inactive') => {
    startTransition(async () => {
      await fetch(`/api/admin/activation-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status === 'active' ? 'inactive' : 'active' }),
      })
      await onRefresh()
    })
  }

  const deleteCode = (id: string) => {
    if (!confirm('Bu kod silinsin mi?')) return
    startTransition(async () => {
      await fetch(`/api/admin/activation-codes/${id}`, { method: 'DELETE' })
      await onRefresh()
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-8">
      <section className="border border-[#1A1612] bg-surface-paper p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl font-black">Yeni proje</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Proje adı (örn. Regon POS)"
            className="border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm"
          />
          <input
            value={projectSlug}
            onChange={(e) => setProjectSlug(e.target.value.toLowerCase())}
            placeholder="slug (örn. regon-pos)"
            className="border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending || !projectName || !projectSlug}
          onClick={createProject}
          className="min-h-[40px] border border-[#1A1612] bg-accent px-4 font-mono text-[11px] uppercase font-bold disabled:opacity-50"
        >
          Proje ekle
        </button>
      </section>

      <section className="border border-[#1A1612] bg-surface-paper p-4 sm:p-6 space-y-3">
        <h2 className="font-display text-xl font-black">Aktivasyon kodu</h2>
        <p className="font-mono text-[11px] text-text-secondary">
          Format: 3 harf + 3 rakam. Aynı kod iki kez üretilemez.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="İşletme adı"
            className="border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm"
          />
          <div className="flex gap-2">
            <input
              value={manualCode}
              onChange={(e) =>
                setManualCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
              }
              placeholder="Elle kod veya boş bırak"
              maxLength={6}
              className="flex-1 border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm tracking-widest"
            />
            <button
              type="button"
              onClick={() => void generateCode()}
              className="border border-[#1A1612] px-3 font-mono text-[10px] uppercase font-bold"
            >
              Üret
            </button>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Not (opsiyonel)"
            className="border border-[#1A1612] bg-[#FAF8F3] px-3 py-2 font-mono text-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending || !businessName || !selectedProjectId}
          onClick={createCode}
          className="min-h-[40px] border border-[#1A1612] bg-accent px-4 font-mono text-[11px] uppercase font-bold disabled:opacity-50"
        >
          Kod oluştur
        </button>
        {message ? <p className="font-mono text-xs text-accent-ink">{message}</p> : null}
      </section>

      <section className="border border-[#1A1612] bg-surface-paper overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-[#1A1612] bg-surface-1">
            <tr>
              <th className="px-3 py-2">Kod</th>
              <th className="px-3 py-2">İşletme</th>
              <th className="px-3 py-2">Proje</th>
              <th className="px-3 py-2">Durum</th>
              <th className="px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-[#1A1612]/15">
                <td className="px-3 py-2 font-bold tracking-wider">{c.code}</td>
                <td className="px-3 py-2">{c.business_name}</td>
                <td className="px-3 py-2">{c.projectName}</td>
                <td className="px-3 py-2 uppercase">
                  {c.status === 'active' ? 'Aktif' : 'Pasif'}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleCode(c.id, c.status)}
                    className="underline"
                  >
                    {c.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => deleteCode(c.id)}
                    className="underline text-red-900"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {codes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-text-muted">
                  Henüz kod yok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  )
}
