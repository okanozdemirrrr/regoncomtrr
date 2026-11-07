import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { getPortalContext } from '@/lib/portal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Müşteri Portalı',
  description: 'Regon Teknoloji müşteri portalı.',
  robots: { index: false, follow: false },
}

/** Oturum/cookie bağımlı — anlık navigasyon doğrulaması yok */
export const instant = false

export default async function PortalPage() {
  const session = await getPortalContext()
  if (!session) redirect('/portal/giris')

  return (
    <Container className="py-12">
      <div className="border-2 border-[#1A1612] bg-surface-paper p-8 sm:p-10 shadow-[4px_4px_0px_#1A1612]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-dashed border-[#1A1612]/30 pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink mb-1">
              {'// OPERASYON MASASI'}
            </p>
            <h1 className="font-display text-3xl font-black text-text-primary">Müşteri Portalı</h1>
            <p className="font-mono text-xs text-text-secondary mt-1">
              İşletme: {session.tenantName}
            </p>
          </div>
          <form action="/api/portal/logout" method="POST">
            <button
              type="submit"
              className="border border-[#1A1612] bg-[#FAF8F3] px-4 py-2 font-mono text-xs uppercase font-bold text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3] transition-colors min-h-[44px]"
            >
              Çıkış Yap
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="border border-[#1A1612]/20 bg-surface-1 p-6">
            <p className="font-mono text-xs uppercase text-accent-ink font-bold mb-3">
              Bağlı projeler
            </p>
            {session.projects.length === 0 ? (
              <p className="font-mono text-sm text-text-muted">Bağlı proje yok</p>
            ) : (
              <ul className="space-y-2">
                {session.projects.map((project, index) => (
                  <li
                    key={project.id}
                    className={
                      index === session.projects.length - 1
                        ? 'flex items-center justify-between'
                        : 'flex items-center justify-between border-b border-dashed border-[#1A1612]/20 pb-2'
                    }
                  >
                    <span className="font-mono text-sm text-text-primary">{project.name}</span>
                    <span className="font-mono text-[10px] text-accent-ink">Aktif</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-[#1A1612]/20 bg-surface-1 p-6">
            <p className="font-mono text-xs uppercase text-accent-ink font-bold mb-3">
              Açık talepler
            </p>
            <p className="font-display text-4xl font-black text-text-primary">0</p>
            <p className="font-mono text-[10px] text-text-muted mt-1">Henüz talep yok</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              disabled
              className="border border-[#1A1612]/30 bg-surface-2 px-4 py-3 font-mono text-xs uppercase font-bold text-text-muted cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Yeni geri bildirim</span>
              <span className="text-[10px] bg-[#1A1612]/10 px-2 py-0.5">Yakında</span>
            </button>
            <button
              type="button"
              disabled
              className="border border-[#1A1612]/30 bg-surface-2 px-4 py-3 font-mono text-xs uppercase font-bold text-text-muted cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Taleplerim</span>
              <span className="text-[10px] bg-[#1A1612]/10 px-2 py-0.5">Yakında</span>
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
