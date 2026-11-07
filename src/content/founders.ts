// ============================================================
// Regon Teknoloji — Ekip / Eğitim Alanları
// Bölümler kişi değil; eğitim alanları ayrı listelenir.
// Kurucu kişi bilgisi şimdilik boş tutulur (ad dolunca gösterilir).
// ============================================================

/** Eğitim / uzmanlık alanı (kişi kartı değil) */
export interface EducationField {
  id: string
  title: string
  description: string
}

/** Kurucu kişi — şimdilik boş; ad dolunca UI’da kullanılabilir */
export interface FounderPerson {
  name: string
  role?: string
}

export const educationFields: EducationField[] = [
  {
    id: 'ai-data',
    title: 'Yapay Zeka ve Veri Mühendisliği',
    description:
      'Veriyle ve algoritmayla düşünen bir ekip; kurye atama, sipariş akışı ve gece sonu kasa hesabı gibi operasyonel problemlere matematiksel ve veri odaklı bakış.',
  },
  {
    id: 'math-cs',
    title: 'Matematik ve Bilgisayar Bilimleri',
    description:
      'Rota optimizasyonu ve kuyruk teorisi tabanlı sistem mimarisi; karmaşık operasyonel problemleri matematiksel modellemeyle çözen yaklaşım.',
  },
]

/** Kurucu kişi listesi — şimdilik boş */
export const founders: FounderPerson[] = []

export const educationStatusNote =
  'Ekibimiz bu iki niş bölümde eğitimine devam ediyor.'
