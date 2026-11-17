// ============================================================
// Türkçe metin katmanı — somut, ürüne özgü metinler
// Jenerik pazarlama dili yok.
// ============================================================

const tr = {
  meta: {
    siteName: 'Regon Teknoloji',
    siteDescription:
      'Regon Teknoloji (eski adıyla Mergen Teknoloji) — yazılım, donanım, yapay zekâ, sensör ve otomasyon: işletmelerin ve bireylerin gerçek sorunlarına çözüm üreten ürün ve araştırma ekibi.',
    defaultTitle: 'Regon Teknoloji | Ürün ve Araştırma',
  },
  nav: {
    home: 'Ana Sayfa',
    projects: 'Ürünler',
    about: 'Hakkımızda',
    contact: 'İletişim',
    portal: 'Müşteri Girişi',
    menuOpen: 'Menüyü aç',
    menuClose: 'Menüyü kapat',
  },
  hero: {
    eyebrow: 'Yazılım · Donanım · Yapay Zekâ',
    headline: 'Sorun varsa\nçözeriz.',
    sub: 'Devre kartından yazılıma, yapay zekâdan sensör ve otomasyona — işletmelerin de bireylerin de gerçek sorunlarına çözüm üretiyoruz.',
    cta: 'Ürünleri incele',
    ctaPortal: 'Müşteri girişi',
  },
  projects: {
    sectionLabel: 'Ürünler',
    sectionHeadline: 'Ürünler',
    statusLive: 'Canlı',
    statusDev: 'Geliştirmede',
    detailsCta: 'Detayları gör',
  },
  footer: {
    formerName: 'eski adıyla Mergen Teknoloji',
    rights: 'Tüm hakları saklıdır.',
    tagline: 'Restoran, kurye ve bayi yazılımları.',
  },
  a11y: {
    skipToMain: 'Ana içeriğe geç',
  },
} as const

export default tr
export type Translations = typeof tr
