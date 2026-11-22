import { connection } from 'next/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { listTicketsAdmin } from '@/lib/ticket-api'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yönetici Paneli',
  description: 'Regon Teknoloji yönetici paneli.',
  robots: { index: false, follow: false },
}

/** Oturum/cookie bağımlı */
export const instant = false

export default async function AdminPage() {
  await connection()
  const authed = await isAdminAuthenticated()

  if (!authed) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm border border-[#1A1612] bg-surface-paper p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink mb-2">
            {'// YETKİ'}
          </p>
          <h1 className="font-display text-2xl font-black mb-6">Yönetici girişi</h1>
          <AdminLoginForm />
        </div>
      </div>
    )
  }

  const supabase = getSupabaseServerClient()
  const [{ data: projects }, tickets, codesRes] = await Promise.all([
    supabase.from('projects').select('id, slug, name, status').order('name', { ascending: true }),
    listTicketsAdmin({}),
    supabase
      .from('activation_codes')
      .select('id, code, project_id, business_name, status, note, created_at, last_used_at')
      .order('created_at', { ascending: false }),
  ])

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.name]))
  const codes = (codesRes.data ?? []).map((row) => ({
    ...row,
    projectName: projectMap.get(row.project_id) ?? null,
  }))

  return (
    <AdminDashboard
      initialProjects={projects ?? []}
      initialTickets={tickets}
      initialCodes={codes}
    />
  )
}
