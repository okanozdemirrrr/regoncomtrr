import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
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
  const session = await getPortalContext()
  if (session) redirect('/portal')

  const { hata } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Container className="max-w-md">
        <div className="border-2 border-[#1A1612] bg-surface-paper p-8 sm:p-10 shadow-[4px_4px_0px_#1A1612]">
          <div className="text-center mb-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink mb-2">
              {'// PORTAL FİŞİ'}
            </p>
            <h1 className="font-display text-3xl font-black text-text-primary mb-2">
              Müşteri Portalı
            </h1>
            <p className="font-mono text-xs text-text-secondary">
              Aktivasyon kodunuzla operasyon masasına girin
            </p>
          </div>

          <PortalLoginForm initialError={hata} />

          <div className="mt-6 text-center">
            <Link
              href="/#iletisim"
              className="font-mono text-xs text-accent-ink hover:underline min-h-[44px] inline-flex items-center"
            >
              Kodunu mu kaybettin? Bize ulaş
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
