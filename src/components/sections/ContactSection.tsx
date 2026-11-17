import { Container } from '@/components/ui/Container'
import { Reveal, LineDraw } from '@/components/animations/MotionComponents'
import { siteConfig } from '@/content/siteConfig'

export function ContactSection() {
  const { email, phone, address, supportEmail } = siteConfig.contact

  return (
    <section id="iletisim" className="build-section py-20 sm:py-28 bg-background">
      <Container>
        <div className="mb-12">
          <div className="build-element flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-ink">
              {'// 04 · İLETİŞİM & DOĞRUDAN DESTEK'}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              [ DOĞRUDAN DESTEK HATTI ]
            </span>
          </div>
          <LineDraw direction="horizontal" className="mt-3" />
        </div>

        <div className="border border-[#1A1612] bg-surface-paper p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            {/* Sol Kolon: Başlık ve Açıklama */}
            <div className="lg:col-span-7 space-y-4">
              <Reveal>
                <h2 data-build-delay="100" className="build-element build-typewriter font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
                  Sahanız için demo veya kurulum planlayalım.
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p data-build-delay="200" className="build-element text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
                  Restoranınız, kurye filonuz veya bayi ağınız için sistemi yerinde kuralım. Doğrudan teknik ekiple iletişime geçin, çalışma modelinizi birlikte değerlendirelim.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div data-build-delay="300" className="build-element border-l-2 border-accent-ink bg-surface-1 p-4 mt-4">
                  <p className="font-mono text-xs uppercase font-bold text-accent-ink mb-1">
                    FİYAT/HIZ VAADİ
                  </p>
                  <p className="text-sm text-text-primary">
                    {siteConfig.priceSpeedPromise.selected}
                  </p>
                </div>
              </Reveal>

              <div className="pt-4 font-mono text-xs text-text-muted">
                <p>* İletişim formu ve otomatik talep mekanizması Aşama 6&apos;da açılacaktır. Şimdilik doğrudan arama ve e-posta hatlarımız aktiftir.</p>
              </div>
            </div>

            {/* Sağ Kolon: İletişim Bağlantıları (Config tabanlı, hardcoded değil) */}
            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div data-build-delay="300" className="build-element border border-[#1A1612] bg-[#FAF8F3] p-4 space-y-1">
                <span className="text-[10px] uppercase text-text-muted block">KURULUM & GENEL İLETİŞİM</span>
                <a
                  href={`mailto:${email}`}
                  className="font-bold text-sm text-text-primary hover:text-accent-ink hover:underline flex items-center justify-between"
                >
                  <span>{email}</span>
                  <span>→</span>
                </a>
              </div>

              <div data-build-delay="400" className="build-element border border-[#1A1612] bg-[#FAF8F3] p-4 space-y-1">
                <span className="text-[10px] uppercase text-text-muted block">TELEFON DESTEK HATTI</span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-bold text-sm text-text-primary hover:text-accent-ink hover:underline flex items-center justify-between"
                >
                  <span>{phone}</span>
                  <span>→</span>
                </a>
              </div>

              <div data-build-delay="500" className="build-element border border-[#1A1612] bg-[#FAF8F3] p-4 space-y-1">
                <span className="text-[10px] uppercase text-text-muted block">TEKNİK DESTEK & OPERASYON</span>
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-bold text-sm text-text-primary hover:text-accent-ink hover:underline flex items-center justify-between"
                >
                  <span>{supportEmail}</span>
                  <span>→</span>
                </a>
              </div>

              <div data-build-delay="600" className="build-element border border-[#1A1612]/30 bg-surface-1 p-4 space-y-1 text-text-secondary">
                <span className="text-[10px] uppercase text-text-muted block">SAHA MERKEZİ</span>
                <p className="font-semibold text-text-primary">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
