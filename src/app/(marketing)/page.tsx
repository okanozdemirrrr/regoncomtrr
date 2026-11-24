import { Container } from '@/components/ui/Container'
import { ScrollBuild } from '@/components/animations/ScrollBuild'
import { ProductsSection } from '@/components/sections/ProductsSection'
import { PortalCtaSection } from '@/components/sections/PortalCtaSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { HowWeWorkSection } from '@/components/sections/HowWeWorkSection'
import { ContactSection } from '@/components/sections/ContactSection'

/**
 * Regon Teknoloji — Ana Sayfa (Revize Mimari)
 * 1. Hero Bölümü (hızlı giriş; scroll-build YOK)
 * 2. Ürünlerimiz Vitrini (2x2 Asimetrik Endüstriyel Bento Grid, Tıklayınca Çekmece)
 * 3. Müşteri Portalı Çağrısı (CTA)
 * 4. Biz Kimiz & Mühendislik Altyapımız (Yapay Zeka, Matematik & Fiyat/Hız Garantisi)
 * 5. Nasıl Çalışıyoruz & İletişim / Footer
 */
export default function HomePage() {
  return (
    <>
      {/* ============================================================
          1. HERO BÖLÜMÜ — hızlı giriş animasyonu (wireframe yok)
          ============================================================ */}
      <section className="relative border-b border-[#1A1612]/20 py-10 sm:py-12 lg:py-14 bg-background overflow-hidden">
        <Container>
          <div className="hero-enter max-w-3xl space-y-5">
            {/* Sistem Etiketi */}
            <div className="inline-flex flex-wrap items-center gap-2 border border-[#1A1612]/30 bg-surface-paper px-2.5 py-1 font-mono text-[11px] text-text-secondary">
              <span className="size-2 shrink-0 rounded-full bg-accent" />
              <span className="font-bold text-accent-ink">{'// ÜRÜN VE ARAŞTIRMA EKİBİ'}</span>
              <span className="text-text-muted">· YAZILIM · DONANIM · YAPAY ZEKÂ</span>
            </div>

            {/* Ana Başlık */}
            <h1 className="font-display text-3xl font-black leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              <span className="block">Sorun varsa</span>
              <span className="block">üretiriz.</span>
            </h1>

            {/* Somut Açıklama */}
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-text-secondary">
              Devre kartından yazılıma, yapay zekâdan sensör ve otomasyona — işletmelerin de
              bireylerin de gerçek sorunlarına çözüm üretiyoruz.
            </p>

            {/* Kısa kanıt kutuları */}
            <div className="border-t border-dashed border-[#1A1612]/30 pt-3 font-mono text-xs text-text-secondary">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                  <span className="text-accent-ink font-bold">01.</span> 4 ürün piyasada
                </div>
                <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                  <span className="text-accent-ink font-bold">02.</span> 19 işletme aktif kullanıyor
                </div>
                <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                  <span className="text-accent-ink font-bold">03.</span> 3 kişiyle 5 ayda
                </div>
              </div>
            </div>

            {/* CTA Butonları */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href="#urunler"
                className="inline-flex h-10 sm:h-11 items-center justify-center border border-[#1A1612] bg-[#1A1612] px-6 font-mono text-xs uppercase font-bold tracking-wider text-[#FAF8F3] hover:bg-accent hover:border-accent hover:text-[#100F0D] transition-colors shadow-[2px_2px_0px_#1A1612]"
              >
                Ürünleri İncele ↓
              </a>
              <a
                href="/portal/giris"
                className="inline-flex h-10 sm:h-11 items-center justify-center border border-[#1A1612] bg-[#FAF8F3] px-6 font-mono text-xs uppercase font-bold tracking-wider text-text-primary hover:bg-surface-2 transition-colors"
              >
                Müşteri Girişi →
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          SİSTEM DURUM BANTI (Operasyon Ticker)
          ============================================================ */}
      <section className="border-b border-[#1A1612]/20 bg-surface-1 py-2.5 font-mono text-[11px] text-text-secondary">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 rounded-full bg-accent animate-pulse" />
              <span className="font-bold text-text-primary">SİSTEM ÇEVRİMİÇİ</span>
              <span className="hidden sm:inline text-text-muted">{'//'}</span>
              <span className="hidden sm:inline">SAHA DAĞITIM VE POS AĞI HAZIR</span>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span>MÜŞTERİ TANIMA: AKTİF</span>
              <span>TERMAL YAZICI: AKTİF</span>
              <span className="text-accent-ink font-bold">CANLI HARİTA: AKTİF</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================================================
          2. ÜRÜNLERİMİZ VİTRİNİ (2x2 Asimetrik Bento Grid & Detay Çekmecesi)
          ============================================================ */}
      <ProductsSection />

      {/* ============================================================
          3. MÜŞTERİ PORTALI ÇAĞRISI (CTA)
          ============================================================ */}
      <PortalCtaSection />

      {/* ============================================================
          4. BİZ KİMİZ & MÜHENDİSLİK ALTYAPIMIZ (Yapay Zeka + Matematik + Fiyat/Hız)
          ============================================================ */}
      <AboutSection />

      {/* ============================================================
          5. NASIL ÇALIŞIYORUZ (Yerinde Kurulum ve 4 Somut Saha Adımı)
          ============================================================ */}
      <HowWeWorkSection />

      {/* ============================================================
          6. İLETİŞİM & DOĞRUDAN DESTEK HATTI
          ============================================================ */}
      <ContactSection />

      {/* Scroll-triggered build animation (wireframe → filling → complete) */}
      <ScrollBuild />
    </>
  )
}
