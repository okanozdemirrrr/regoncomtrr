import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { LostCodeHelp } from '@/components/portal/LostCodeHelp'
import { PortalLoginForm } from '@/components/portal/PortalLoginForm'
import { getPortalContext } from '@/lib/portal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal Giriş',
  description: 'Regon Teknoloji müşteri portalı girişi.',
  robots: { index: false, follow: false },
}

/** Oturum/cookie bağımlı — anlık navigasyon doğrulaması yok */
export const instant = false

interface Props {
  searchParams: Promise<{ hata?: string }>
}

export default async function PortalLoginPage({ searchParams }: Props) {
  await connection()
  const session = await getPortalContext()
  if (session) redirect('/portal')

  const { hata } = await searchParams

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center py-12 px-4">
      <Container className="max-w-md">
        <div className="border border-[#1A1612] bg-surface-paper p-8 sm:p-10">
          <div className="text-center mb-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink mb-2">
              {'// PORTAL FİŞİ'}
            </p>
            <h1 className="font-display text-3xl font-black text-text-primary mb-2">
              Müşteri Portalı
            </h1>
            <p className="font-mono text-xs text-text-secondary">
              Aktivasyon kodunuzla destek sohbetine girin
            </p>
          </div>

          <PortalLoginForm initialError={hata} />

          <LostCodeHelp />
        </div>
      </Container>
    </div>
  )
}
