import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yönetim',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-background text-text-primary">{children}</div>
}
