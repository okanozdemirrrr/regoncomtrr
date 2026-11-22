import type { Metadata } from 'next'
import { Bricolage_Grotesque, JetBrains_Mono, Archivo } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { SCROLL_BUILD_PREPAINT_SCRIPT } from '@/lib/scroll-build'
import tr from '@/i18n/tr'

/* Bricolage Grotesque — karakterli ağır başlık fontu */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
})

/* JetBrains Mono — fiş, sayı ve etiket detayları */
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

/* Archivo — gövde metni */
const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://regon.com.tr'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: tr.meta.defaultTitle,
    template: '%s | Regon Teknoloji',
  },
  description: tr.meta.siteDescription,
  keywords: [
    'regon teknoloji',
    'mergen teknoloji',
    'kurye takip yazılımı',
    'restoran pos',
    'bayi yönetim sistemi',
    'pazar yeri yazılımı',
    'sipariş yönetimi',
  ],
  authors: [{ name: 'Regon Teknoloji' }],
  creator: 'Regon Teknoloji',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: tr.meta.siteName,
    title: tr.meta.defaultTitle,
    description: tr.meta.siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: tr.meta.defaultTitle,
    description: tr.meta.siteDescription,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${bricolage.variable} ${jetbrains.variable} ${archivo.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Scroll-build: hydration öncesi iskelet görünümü (flaş önleme) */}
        <script dangerouslySetInnerHTML={{ __html: SCROLL_BUILD_PREPAINT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}
