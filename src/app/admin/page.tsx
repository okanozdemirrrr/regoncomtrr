import { Container } from '@/components/ui/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yönetici Paneli',
  description: 'Regon Teknoloji yönetici paneli.',
  robots: { index: false, follow: false },
}

/**
 * Admin paneli iskeleti — Supabase Auth koruması Aşama 6'da.
 */
export default function AdminPage() {
  return (
    <Container className="flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <div className="border-2 border-[#1A1612] bg-surface-paper p-10 sm:p-14 shadow-[4px_4px_0px_#1A1612]">
        <h1 className="mb-3 font-display text-2xl font-black text-text-primary">Yönetici Paneli</h1>
        <p className="mb-6 font-mono text-xs text-text-secondary">
          Bu alan yalnızca Regon yöneticileri içindir. Kimlik doğrulama Aşama 6&apos;da açılacak.
        </p>
        <span className="inline-flex items-center gap-1.5 border border-[#1A1612] bg-surface-1 px-3 py-1 font-mono text-[10px] uppercase font-bold text-text-primary">
          Geliştirmede — Aşama 6
        </span>
      </div>
    </Container>
  )
}
