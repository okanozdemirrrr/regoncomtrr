import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { PortalDesk } from '@/components/portal/PortalDesk'
import { getPortalContext } from '@/lib/portal'
import { listTicketsForCode } from '@/lib/ticket-api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Müşteri Destek Portalı',
  description: 'Regon Teknoloji müşteri destek portalı.',
  robots: { index: false, follow: false },
}

/** Oturum/cookie bağımlı — anlık navigasyon doğrulaması yok */
export const instant = false

export default async function PortalPage() {
  await connection()
  const session = await getPortalContext()
  if (!session) redirect('/portal/giris')

  const tickets = await listTicketsForCode(session.activationCodeId)

  return (
    <PortalDesk
      businessName={session.businessName}
      projectName={session.project.name}
      initialTickets={tickets}
    />
  )
}
