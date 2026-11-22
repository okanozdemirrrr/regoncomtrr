import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import tr from '@/i18n/tr'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        {tr.a11y.skipToMain}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  )
}
