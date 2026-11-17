import { Container } from '@/components/ui/Container'
import { Reveal, LineDraw } from '@/components/animations/MotionComponents'

const steps = [
  {
    no: '01',
    title: 'Saha Keşfi ve Yerinde İnceleme',
    desc: 'Restoranınızı, mutfağınızı veya kurye alanınızı yerinde ziyaret eder; sipariş yoğunluğunuzu, masa düzeninizi ve teslimat ritminizi sahasında anlarız.',
  },
  {
    no: '02',
    title: 'Yerinde Donanım ve Yazılım Kurulumu',
    desc: 'Dokunmatik POS terminalini, 80mm mutfak termal yazıcısını ve kuryelerin cep telefonlarına mobil uygulamaları bizzat kendimiz kurar, test ederiz.',
  },
  {
    no: '03',
    title: 'İlk Sipariş ve Personel Eğitimi',
    desc: 'İlk siparişi kasada birlikte açar, mutfakta ilk fişin düşüşünü görür, kurye ile birlikte test paketi atarak teslimatı kapıda birlikte onaylarız.',
  },
  {
    no: '04',
    title: 'Kesintisiz Birebir Mühendis Desteği',
    desc: 'Sistem canlıya geçer. Çağrı merkezinde beklemeden; doğrudan kurulumu yapan mühendislerimizle anlık destek hattından görüşürsünüz.',
  },
]

export function HowWeWorkSection() {
  return (
    <section id="nasil-calisiyoruz" className="build-section py-16 sm:py-24 border-b border-[#1A1612]/20 bg-surface-1">
      <Container>
        <div className="mb-12">
          <div className="build-element flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent-ink">
              {'// 03 · NASIL ÇALIŞIYORUZ'}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              [ KURULUM & SAHA DESTEĞİ ]
            </span>
          </div>
          <LineDraw direction="horizontal" className="mt-3" />
        </div>

        <div className="max-w-3xl space-y-6">
          <Reveal>
            <h2 data-build-delay="100" className="build-element build-typewriter font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
              Kutuyu kargolayıp çekilmiyoruz; bizzat tezgaha gelip kuruyoruz.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p data-build-delay="200" className="build-element text-sm sm:text-base leading-relaxed text-text-secondary">
              Restoran ve kurye operasyonunda aksayan bir saniye bile ciro kaybıdır. Bu yüzden uzaktan kullanım kılavuzu göndermek yerine, kurulumu dükkanınızda sizinle birlikte tamamlıyoruz.
            </p>
          </Reveal>

          <div className="relative border-l border-dashed border-[#1A1612]/40 pl-6 sm:pl-8 space-y-7 pt-4">
            {steps.map((step, idx) => (
              <Reveal key={step.no} delay={0.08 * idx}>
                <div data-build-delay={250 + idx * 120} className="build-element relative">
                  {/* Adım Noktası */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 size-3.5 border border-[#1A1612] bg-accent" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-ink">
                        ADIM {step.no}
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
