import { Container } from '@/components/ui/Container'
import { Reveal, LineDraw, SplitLines } from '@/components/animations/MotionComponents'
import { educationFields, educationStatusNote } from '@/content/founders'
import { siteConfig } from '@/content/siteConfig'

export function AboutSection() {
  return (
    <section id="biz-kimiz" className="build-section relative border-b border-[#1A1612]/20 py-16 sm:py-24 bg-surface-1">
      <Container>
        {/* Bölüm Başlığı */}
        <div className="mb-10">
          <div className="build-element flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-ink">
              {'// 02 · BİZ KİMİZ & MÜHENDİSLİK ALTYAPIMIZ'}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              [ {siteConfig.company.formerName} ]
            </span>
          </div>
          <LineDraw direction="horizontal" className="mt-3" />
        </div>

        <div className="max-w-4xl space-y-6">
          <Reveal>
            <h2 data-build-delay="100" className="build-element build-typewriter font-display text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-text-primary">
              <SplitLines
                lines={['Masa başından değil,', 'bizzat sahadan yazılım üretiyoruz.']}
                lineClassName="text-text-primary"
              />
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p data-build-delay="200" className="build-element text-base sm:text-lg leading-relaxed text-text-secondary">
              Regon Teknoloji (eski adıyla{' '}
              <strong className="text-text-primary font-semibold">Mergen Teknoloji</strong>
              ); restoran, paket servis ve bayi operasyonlarının ritmini mutfakta ve sahada öğrenen, sistemlerini bizzat kendisi kuran mühendislik ekibidir.
            </p>
          </Reveal>

          {/* Mühendislik Eğitim & Uzmanlık Alanları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {educationFields.map((field, index) => (
              <Reveal key={field.id} delay={0.15 + index * 0.05}>
                <div
                  data-build-delay={300 + index * 120}
                  className="build-element border border-[#1A1612]/30 bg-surface-paper p-5 relative h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-block border border-[#1A1612]/20 bg-surface-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent-ink mb-2">
                      Mühendislik Temeli
                    </div>
                    <h3 className="font-display text-base font-bold text-text-primary mb-2">
                      {field.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {field.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Hız ve Fiyat Garantisi Vurgusu (Güven Unsuru) */}
          <Reveal delay={0.25}>
            <div
              data-build-delay="250"
              className="build-element border-2 border-[#1A1612] bg-[#FAF8F3] p-5 sm:p-6 space-y-2 shadow-[2px_2px_0px_#1A1612]"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-xs uppercase font-bold text-accent-ink tracking-wider">
                  YAPAY ZEKA DESTEKLİ MODERN MÜHENDİSLİK · HIZ VE EN UYGUN FİYAT GARANTİSİ
                </span>
              </div>
              <p className="text-sm text-text-primary font-medium leading-relaxed">
                Yapay zeka ve veri mühendisliği araçlarını yazılım üretim hattımıza doğrudan entegre ettiğimiz için; geleneksel yazılım şirketlerinin aylar süren hantal geliştirme süreçlerini haftalara indiriyoruz.
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Gereksiz ofis ve satış maliyetlerini sıfırlayarak en kararlı sistemi esnaf ve işletmelerimize piyasanın en rekabetçi ve erişilebilir fiyatlarıyla sunuyoruz.
              </p>
              <p className="font-mono text-[10px] text-text-muted pt-1">
                * {educationStatusNote}
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
