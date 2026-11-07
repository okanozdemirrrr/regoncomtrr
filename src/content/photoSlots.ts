// ============================================================
// Regon Teknoloji — Fotoğraf ve Ekran Görüntüsü Alanları Sistemi
// 1'den 25'e kadar kesintisiz numaralandırılmış fotoğraf alanları.
// Her slotta: Slot Numarası, Türkçe Operasyonel Açıklama ve
// Midjourney/Leonardo için kopyalanabilir hazır AI Görsel Üretim Promptu bulunur.
// ============================================================

export type PhotoSlotType = 'EKRAN GÖRÜNTÜSÜ' | 'FOTOĞRAF' | 'ÜRETİLECEK GÖRSEL'

export interface PhotoSlotItem {
  no: number
  section: string
  placement: string
  type: PhotoSlotType
  description: string
  ratio: string
  pixelSize: string
  imagePath: string
  prompt: string
}

export const photoSlots: PhotoSlotItem[] = [
  // ─── HERO BÖLÜMÜ (Slot 01) ───
  {
    no: 1,
    section: 'Hero',
    placement: 'Hero Bölümü sağ tarafı (Ana Sistem Operasyon Konsolu)',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Modern restoran operasyon merkezi: Sol panelde telefon çaldığı an müşteri ve adresi ekranda açılan sipariş fişi, ortada canlı GPS kurye haritası ve sağda dokunmatik kasa ekranı.',
    ratio: '16/10',
    pixelSize: '1920x1200',
    imagePath: '',
    prompt:
      'Professional SaaS software dashboard mockup for an unified restaurant POS and live courier fleet system, dark slate and warm paper industrial color palette, left side showing order slip and incoming caller popup with customer address, center showing GPS map with delivery riders, right side showing kitchen ticket printer queue, modern flat UI, crisp typography, high resolution 8k --ar 16:10',
  },

  // ─── REGON KURYE (Vitrinin Yıldızı - Slot 02 - 07) ───
  {
    no: 2,
    section: 'Regon Kurye',
    placement: 'Ürünler Vitrini: Regon Kurye ana bento kartı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Regon Kurye canlı filo takip konsolu: Şehir haritasında hareket eden motor kuryeler, paket teslimat rotaları, tahmini varış sayaçları ve anlık sipariş kuyruğu.',
    ratio: '16/10',
    pixelSize: '1920x1200',
    imagePath: '',
    prompt:
      'Modern delivery fleet management web dashboard UI, real-time dark GPS map showing motorcycle courier icons with route paths, left sidebar with live incoming package queue, top KPI cards for average delivery time and active riders, clean Scandinavian industrial UI, 8k --ar 16:10',
  },
  {
    no: 3,
    section: 'Regon Kurye',
    placement: 'Çekmece Detayı: Restoran Sipariş Kabul & Kurye Çağrı Paneli',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Restoran sipariş kabul ekranı: Gelen siparişler, hazırlık süresi sayacı ve tek tıkla kurye çağırma butonu ile paket durumu takip listesi.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'Clean restaurant dispatch screen UI showing incoming orders with preparation timer countdown badges, courier dispatch request button, high contrast minimal interface, 8k --ar 16:9',
  },
  {
    no: 4,
    section: 'Regon Kurye',
    placement: 'Çekmece Detayı: Kurye Mobil Uygulaması (Teslimat & Navigasyon)',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Kurye akıllı telefon uygulaması: Teslim alınacak paket detayı, müşteri adresi, tek dokunuşla navigasyon ve arama butonları.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Mobile app UI mockup for courier rider, showing delivery address, one-tap navigation button, customer phone dialer, swipe to complete delivery slider, modern clean mobile UI, vertical 9:16 --ar 9:16',
  },
  {
    no: 5,
    section: 'Regon Kurye',
    placement: 'Çekmece Detayı: Müşteri Canlı Takip Sayfası (SMS Web Linki)',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Müşterinin SMS linkiyle açtığı canlı takip sayfası: Kuryenin motor ikonuyla haritada hareketi, tahmini varış süresi (örn. 8 dk) ve sipariş özeti.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Mobile browser web page UI for customer live delivery tracking, courier moving on live city map, ETA badge displaying 8 mins, order status stepper, minimal elegant UI --ar 9:16',
  },
  {
    no: 6,
    section: 'Regon Kurye',
    placement: 'Çekmece Detayı: Gece Sonu Kurye ve Restoran Kasa Hesabı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Gece sonu hesap tablosu: Hangi kuryenin kaç paket taşıdığı, kapıda nakit/kredi kartı tahsilat toplamları ve tek tuşla dökülen restoran hakediş tablosu.',
    ratio: '16/9',
    pixelSize: '1440x810',
    imagePath: '',
    prompt:
      'Fintech reconciliation table UI dashboard, list of courier riders, cash collected, credit card totals, automated fee calculation, clear tabular layout, high contrast --ar 16:9',
  },
  {
    no: 7,
    section: 'Regon Kurye',
    placement: 'Çekmece Detayı: Kurye Vardiya & Paket Havuzu Ekranı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Kurye mobil arayüzü: Vardiya açma/kapatma durumu, bekleyen paket havuzu ve gün içinde tamamlanan teslimat adedi özeti.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Mobile app screen for courier shift management, toggle shift button, available package pool, daily completed order summary widget, sleek clean dark theme --ar 9:16',
  },

  // ─── REGON POS (Slot 08 - 12) ───
  {
    no: 8,
    section: 'Regon POS',
    placement: 'Ürünler Vitrini: Regon POS ana bento kartı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Regon POS dokunmatik ana kasa arayüzü: Sol panelde masa planı ve adisyon kalemleri, sağda hızlı ürün seçim butonları, üst barda aktif kasa ve telefon çaldığı an müşteri tanıma durumu.',
    ratio: '16/10',
    pixelSize: '1920x1200',
    imagePath: '',
    prompt:
      'Professional touch terminal POS interface for restaurants, order ticket on left, grid of categories and food items on right, modern industrial flat design, high contrast --ar 16:10',
  },
  {
    no: 9,
    section: 'Regon POS',
    placement: 'Çekmece Detayı: Telefon Çaldığı An Müşteri ve Adresi Ekranda Penceresi',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Telefon çaldığı an açılan müşteri tanıma penceresi: Gelen telefon numarası, müşterinin kayıtlı adı, son sipariş verdiği adres ve geçmiş sipariş listesi görünümü.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'UI modal popup for incoming phone call on restaurant POS, customer profile, verified delivery address, previous favorite order list, clean minimal UI --ar 16:9',
  },
  {
    no: 10,
    section: 'Regon POS',
    placement: 'Çekmece Detayı: Tek Tuşla Mutfak ve Paket Fişi Çıktısı',
    type: 'FOTOĞRAF',
    description:
      '80mm termal fiş yazıcısından taze basılmış sipariş fişi: Sipariş numarası, masa/paket bilgisi, sipariş notları ve net ayrılmış kalemler.',
    ratio: '1/1',
    pixelSize: '1080x1080',
    imagePath: '',
    prompt:
      'Close-up documentary photo of a thermal receipt printer on a stainless steel commercial kitchen counter, freshly printed food order receipt with bold numbers, sharp contrast, realistic food service background --ar 1:1',
  },
  {
    no: 11,
    section: 'Regon POS',
    placement: 'Çekmece Detayı: Gece Sonu Kasa Hesabı ve Kapanış Konsolu',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Z-Raporu ve gün sonu kasa kapatma konsolu: Nakit, kredi kartı, çevrimiçi sipariş platformları toplamları ve kasa farkı denetim tablosu.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'Analytical dashboard UI for restaurant daily sales closing report, breakdown of cash, credit card POS, food delivery apps totals, clean accounting data view --ar 16:9',
  },
  {
    no: 12,
    section: 'Regon POS',
    placement: 'Çekmece Detayı: Mobil Garson / Tablet El Terminali',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Mobil el terminali arayüzü: Garsonun masadan doğrudan sipariş girip anında mutfağa gönderdiği dikey arayüz.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Mobile app UI mockup of a waiter ordering terminal, clean restaurant table grid, order draft items with add/remove buttons, elegant modern mobile UI --ar 9:16',
  },

  // ─── REGON BAYİ (Slot 13 - 17) ───
  {
    no: 13,
    section: 'Regon Bayi',
    placement: 'Ürünler Vitrini: Regon Bayi ana bento kartı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Ana Bayi Merkez Yönetim Konsolu: Bağlı tüm şube ve bayilerden gelen günlük mal talepleri listesi, onay bekleyen siparişler ve toplu sevkiyat hazırlık durumu.',
    ratio: '16/10',
    pixelSize: '1920x1200',
    imagePath: '',
    prompt:
      'B2B distribution management system UI dashboard, matrix of regional branch orders, inventory allocation table, dispatch fulfillment status, enterprise software layout --ar 16:10',
  },
  {
    no: 14,
    section: 'Regon Bayi',
    placement: 'Çekmece Detayı: Bayi Mal Talep Ekranı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Alt bayinin girdiği ekran: Koli, hammadde ve ambalaj ürünlerini adet/koli bazında seçip tek tuşla merkeze ilettiği sipariş formu.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'B2B wholesale order placement UI, product catalog with carton quantity counters, minimum order thresholds, one-click order dispatch button --ar 16:9',
  },
  {
    no: 15,
    section: 'Regon Bayi',
    placement: 'Çekmece Detayı: Canlı Talep ve Hazırlık Aşamaları',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Aşama takip konsolu: Talep Gönderildi → Merkez Onayladı → Depoda Hazırlandı → Kargo/Araçta durum çubukları ve anlık bildirim paneli.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'Supply chain tracking dashboard UI, multi-stage progress bar showing requested, approved, packing, dispatched steps, clear typography --ar 16:9',
  },
  {
    no: 16,
    section: 'Regon Bayi',
    placement: 'Çekmece Detayı: Depo Barkod ve Koli Çıkış Sevkiyatı',
    type: 'FOTOĞRAF',
    description:
      'Dağıtım merkezinde barkod okuyucuyla koli çıkışı yapan depo personeli ve paletlenmiş sevkiyat kolileri. Gerçekçi operasyonel depo ortamı.',
    ratio: '16/10',
    pixelSize: '1280x800',
    imagePath: '',
    prompt:
      'Warehouse logistics documentary photo, warehouse worker scanning barcode on cardboard dispatch box with handheld terminal, stacked distribution goods, realistic lighting --ar 16:10',
  },
  {
    no: 17,
    section: 'Regon Bayi',
    placement: 'Çekmece Detayı: Bayi Cari Hesap & Sevkiyat Geçmişi',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Bayi bazlı geçmiş sevkiyat raporu: Şubenin aylık çektiği mal hacmi, fatura ve cari hesap özeti ile sevkiyat irsaliye kayıtları.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'B2B merchant statement and order history UI table, ledger of past dispatches, invoice numbers, total quantities delivered, clean table design --ar 16:9',
  },

  // ─── REGON MARKET (Slot 18 - 22) ───
  {
    no: 18,
    section: 'Regon Market',
    placement: 'Ürünler Vitrini: Regon Market ana bento kartı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Regon Market mobil müşteri uygulaması ana sayfası: İlçedeki yerel restoran ve market listesi, teslimat süreleri, indirim rozetleri ve mahalle pazar yeri vitrini.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Local food and grocery delivery mobile app homepage UI mockup, category tabs, restaurant cards with ratings and delivery times, clean modern mobile interface --ar 9:16',
  },
  {
    no: 19,
    section: 'Regon Market',
    placement: 'Çekmece Detayı: İlçe Franchise Yönetim Konsolu',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'İlçe işletmecisinin yönetim paneli: Bölgedeki aktif işletmeler, günlük toplam sipariş cirosu, kesilen franchise komisyon tutarı ve kurye atama ayarları.',
    ratio: '16/10',
    pixelSize: '1920x1200',
    imagePath: '',
    prompt:
      'Local marketplace franchise operator admin dashboard UI, active merchants map, daily GMV counter, commission fee earned widget, multi-merchant analytics --ar 16:10',
  },
  {
    no: 20,
    section: 'Regon Market',
    placement: 'Çekmece Detayı: Restoran Menü ve Sepet Akışı',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Mobil uygulamada restoran menü detay sayfası: Yemek fotoğrafları, porsiyon/opsiyon seçimleri ve sepet onay çubuğu.',
    ratio: '9/16',
    pixelSize: '1080x1920',
    imagePath: '',
    prompt:
      'Mobile food ordering restaurant menu UI screen, item options modal (extra cheese, sauces), floating view cart button with total price, delightful modern design --ar 9:16',
  },
  {
    no: 21,
    section: 'Regon Market',
    placement: 'Çekmece Detayı: Hazır Kurye Havuzu Eşleşmesi',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'Sipariş düştüğünde sistemin Regon Kurye havuzundan en yakın boştaki motor kuryeyi otomatik pakete atama ekranı.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'Smart dispatch auto-assignment UI modal, nearest available courier matched within radius, dispatch trigger confirmation, streamlined UX --ar 16:9',
  },
  {
    no: 22,
    section: 'Regon Market',
    placement: 'Çekmece Detayı: Esnaf Komisyon & Haftalık Hesap Özeti',
    type: 'EKRAN GÖRÜNTÜSÜ',
    description:
      'İşletmeci ve esnaf hesap tablosu: Her restorandan alınan komisyon oranı, net ödenecek tutar ve haftalık banka transfer özeti.',
    ratio: '16/9',
    pixelSize: '1280x720',
    imagePath: '',
    prompt:
      'Marketplace merchant payout breakdown table UI, commission fee deduction calculation, net payout schedule, clean transparent accounting view --ar 16:9',
  },

  // ─── BİZ KİMİZ (Slot 23 - 24) ───
  {
    no: 23,
    section: 'Biz Kimiz',
    placement: 'Biz Kimiz bölümü / Saha Restoran Kasa Operasyonu Fotoğrafı',
    type: 'FOTOĞRAF',
    description:
      'Sahada restoran kasasında dokunmatik ekranda sipariş alan ve mutfak fişi çıkaran gerçek restoran operasyonu ortamı. Sıcak restoran ışıkları, doğal çalışma anı.',
    ratio: '4/5',
    pixelSize: '1080x1350',
    imagePath: '',
    prompt:
      'Atmospheric documentary photograph of a bustling Turkish restaurant counter, a modern touch POS screen showing order tickets, kitchen receipt printer with paper receipt coming out, warm cinematic lighting, authentic candid workspace, no people posed, 35mm photography --ar 4:5',
  },
  {
    no: 24,
    section: 'Biz Kimiz',
    placement: 'Biz Kimiz bölümü / Mühendislik Masası & Mimari Tasarım Fotoğrafı',
    type: 'FOTOĞRAF',
    description:
      'Mühendislik çalışma masası: Dizüstü bilgisayarda algoritmik kurye dağıtım modeli, kod ekranı, teknik notlar ve kahve fincanı. Samimi ve odaklı çalışma ortamı.',
    ratio: '16/10',
    pixelSize: '1280x800',
    imagePath: '',
    prompt:
      'Documentary photo of a modern engineering workspace, dual laptops with code and route optimization maps, coffee cup, technical paper notes, warm morning sunlight, authentic developer desk atmosphere --ar 16:10',
  },

  // ─── NASIL ÇALIŞIYORUZ (Slot 25) ───
  {
    no: 25,
    section: 'Nasıl Çalışıyoruz',
    placement: 'Nasıl Çalışıyoruz bölümü / Saha Kurulum ve Eğitim Fotoğrafı',
    type: 'FOTOĞRAF',
    description:
      'Regon teknik personelinin restoran tezgahında dokunmatik ekran POS ve kurye telefonunu işletme sahibine birebir kurup test ettiği saha fotoğrafı.',
    ratio: '16/10',
    pixelSize: '1280x800',
    imagePath: '',
    prompt:
      'Authentic documentary photo of a software engineer setting up POS hardware and mobile app on a restaurant counter with a restaurant owner looking on, hands-on field onboarding, genuine candid lighting --ar 16:10',
  },
]

export function getPhotoSlot(no: number): PhotoSlotItem | undefined {
  return photoSlots.find((slot) => slot.no === no)
}
