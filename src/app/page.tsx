import { Container } from '@/components/ui/Container'
import { PhotoSlot } from '@/components/ui/PhotoSlot'
import { SplitLines, Reveal } from '@/components/animations/MotionComponents'
import { ProductsSection } from '@/components/sections/ProductsSection'
import { PortalCtaSection } from '@/components/sections/PortalCtaSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { HowWeWorkSection } from '@/components/sections/HowWeWorkSection'
import { ContactSection } from '@/components/sections/ContactSection'
import tr from '@/i18n/tr'

/**
 * Regon Teknoloji — Ana Sayfa (Revize Mimari)
 * 1. Hero Bölümü (Kompakt, Fiş yerine FOTO #01 PhotoSlot)
 * 2. Ürünlerimiz Vitrini (2x2 Asimetrik Endüstriyel Bento Grid, Tıklayınca Çekmece)
 * 3. Müşteri Portalı Çağrısı (CTA)
 * 4. Biz Kimiz & Mühendislik Altyapımız (Yapay Zeka, Matematik & Fiyat/Hız Garantisi)
 * 5. Nasıl Çalışıyoruz & İletişim / Footer
 */
export default function HomePage() {
  return (
    <>
      {/* ============================================================
          1. HERO BÖLÜMÜ (Kompakt, Sola Yaslı, FOTO #01)
          ============================================================ */}
      <section className="relative border-b border-[#1A1612]/20 py-10 sm:py-12 lg:py-14 bg-background overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Sol Taraf: Dev Başlık ve Somut Açıklama (Sola Yaslı) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Sistem Etiketi */}
              <div className="inline-flex items-center gap-2 border border-[#1A1612]/30 bg-surface-paper px-2.5 py-1 font-mono text-[11px] text-text-secondary">
                <span className="size-2 rounded-full bg-accent" />
                <span className="font-bold text-accent-ink">{'// OPERASYON ALTYAPISI'}</span>
                <span className="text-text-muted">· RESTORAN · KURYE · BAYİ</span>
              </div>

              {/* Ana Başlık */}
              <h1 className="font-display text-3xl font-black leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                <SplitLines
                  lines={['Telefon çalıyor.', 'Fiş basılıyor.', 'Kurye yolda.']}
                  lineClassName="text-text-primary"
                />
              </h1>

              {/* Somut Açıklama */}
              <Reveal delay={0.15}>
                <p className="max-w-xl text-sm sm:text-base leading-relaxed text-text-secondary">
                  {tr.hero.sub}
                </p>
              </Reveal>

              {/* Operasyon Masası Adımları (Teknik Konsol Bilgisi) */}
              <Reveal delay={0.25}>
                <div className="border-t border-dashed border-[#1A1612]/30 pt-3 font-mono text-xs text-text-secondary">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                      <span className="text-accent-ink font-bold">01.</span> Telefon çalar çalmaz müşteri ve adresi ekranda
                    </div>
                    <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                      <span className="text-accent-ink font-bold">02.</span> Tek tuşla otomatik mutfak ve paket fişi
                    </div>
                    <div className="border border-[#1A1612]/20 bg-surface-paper p-2">
                      <span className="text-accent-ink font-bold">03.</span> Haritada canlı kurye takibi
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* CTA Butonları */}
              <Reveal delay={0.35}>
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
              </Reveal>
            </div>

            {/* Sağ Taraf: FOTO #01 PhotoSlot (Fiş yerine Operasyon Ekranı) */}
            <div className="lg:col-span-6">
              <PhotoSlot
                no={1}
                ratio="16/10"
                priority
                caption="// Slot 01: Regon Birleşik Operasyon Konsolu (POS & Harita)"
              />
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
    </>
  )
}
