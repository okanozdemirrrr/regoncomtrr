import type { Project } from '@/types/project'

/**
 * Merkezi proje içerik deposu — Sadeleştirilmiş Esnaf ve Saha Dili
 * Teknik/İngilizce terimler (Caller ID, SaaS, Multi-tenant, Hibrit, Mutabakat, Entegrasyon)
 * tamamen kaldırılmış, doğrudan işletmecinin anlayacağı sonuç odaklı dil kullanılmıştır.
 */
export const projects: Project[] = [
  // ─── 1. REGON KURYE (VİTRİNİN YILDIZI) ───
  {
    slug: 'regon-kurye',
    name: 'Regon Kurye',
    subname: 'Vitrinin Yıldızı // Canlı Filo & Teslimat Motoru',
    stepNumber: '01',
    stepLabel: '01 · DAĞITIM & CANLI HARİTA',
    orderJourneyState: 'SİPARİŞ // FİŞ ÇIKTI, KURYE YOLDA, CANLI HARİTA',
    tagline: 'Restoran paketi salar, kurye yola çıkar, müşteri haritada canlı izler, gece sonu hesap tek tuşla kuruşu kuruşuna kapanır.',
    keyBenefit:
      'Restorandan paketi çıkarır, kuryeyi haritada canlı izletir; gün sonunda kimde ne kadar para var kuruşu kuruşuna hesaplar.',
    keyTags: ['Canlı GPS Harita', 'Müşteri SMS Takibi', 'Gece Sonu Hesap Kapatma'],
    targetAudience:
      'Kendi motor kurye filosunu çalıştıran paket servis restoranları, bağımsız kurye konsorsiyumları ve esnaf paket dağıtım ağları.',
    problemSolved:
      '"Kurye nerede kaldı?" telefonlarını, kuryelerin hangi paketi ne zaman teslim ettiğinin belirsizliğini ve gün sonundaki nakit karmaşasını tamamen bitirir.',
    descriptionShort:
      'Restoran, kurye ve filo yöneticisi için 3 ayrı panel. Anlık kurye GPS haritası, otomatik paket havuzu ve gece sonu kurye ile kasa hesabı tek tuşla hazır.',
    descriptionLong: `Regon Kurye, restoran ve kurye operasyonlarının sahadaki en büyük sancılarını ortadan kaldırmak için sıfırdan geliştirilmiş filo yönetim altyapısıdır.

Restoran panelden siparişi açıp kurye çağırır. Kurye mobil uygulamasından paketi kabul eder, tek tuşla navigasyon rotasını açar. Müşteriye SMS ile giden link üzerinden kuryenin motosikleti haritada canlı olarak izlenir. Kapıda nakit veya kartla teslimat yapıldığında işlem kapanır. Gece filo kapanışında her kuryenin taşıdığı paket sayısı, cebindeki nakit ve restorana ödenecek tutar tek tuşla kuruşu kuruşuna dökülür.`,
    features: [
      { icon: 'Realtime', label: 'Gecikmesiz Canlı Akış', description: 'Yeni gelen siparişler ve kurye hareketleri tüm ekranlara saniyesinde yansır.' },
      { icon: 'Map', label: 'Gerçek Zamanlı Canlı Harita', description: 'Filodaki tüm motorların harita üzerinde hızı, kalan mesafesi ve tahmini varış süresi canlı izlenir.' },
      { icon: 'Panels', label: 'Üç Ayrı Operasyon Paneli', description: 'Restoran ekranı, kurye cep uygulaması ve merkez yönetim konsolu birbiriyle eşzamanlı çalışır.' },
      { icon: 'MobileDevice', label: 'Şarj Dostu Kurye Uygulaması', description: 'Kuryelerin telefonlarında pili bitirmeden, arka planda güvenle çalışan yerel kurye uygulaması.' },
      { icon: 'Reconciliation', label: 'Gece Sonu Kurye ve Kasa Hesabı Tek Tuşla Hazır', description: 'Kurye başı teslimat adedi, toplanan kapıda nakit, slip toplamları ve restoran hakediş tablosu tek tuşla otomatik çıkar.' },
      { icon: 'Motorcycle', label: 'Müşteri Canlı Takip Sayfası', description: 'Müşteri uygulama yüklemeden SMS web linkiyle kuryenin kapıya gelişini canlı haritada görür.' },
    ],
    workflowSteps: [
      { step: '1', title: 'Paket Açılır', desc: 'Restoran adisyonu hazırlar ve tek tuşla kurye havuzuna çağrı gönderir.' },
      { step: '2', title: 'Kurye Kabul Eder', desc: 'Kurye cep uygulamasından paketi kabul eder ve restorandan teslim alır.' },
      { step: '3', title: 'Canlı İzlenir', desc: 'Müşteri SMS linkiyle kuryeyi canlı haritada izler; konum anlık güncellenir.' },
      { step: '4', title: 'Kapı Teslimi', desc: 'Kapıda nakit veya kart tahsilatı yapılır, kurye tek hareketle teslimatı kapatır.' },
      { step: '5', title: 'Gece Sonu Hesap Kapanışı', desc: 'Gece filo kapanışında kuryenin üzerindeki nakit ve restoran hesabı kuruşu kuruşuna tek tuşla dökülür.' },
    ],
    heroSlotNo: 2,
    detailSlotNos: [3, 4, 5, 6, 7],
    status: 'development',
    accentColor: '#14C9BE',
    coverImagePath: '/images/projects/regon-kurye/cover.webp',
    sortOrder: 1,
    isStar: true,
  },

  // ─── 2. REGON POS ───
  {
    slug: 'regon-pos',
    name: 'Regon POS',
    subname: 'Eski adıyla Mergen POS // Dokunmatik Kasa & Adisyon',
    stepNumber: '02',
    stepLabel: '02 · GİRİŞ & DOKUNMATİK KASA',
    orderJourneyState: 'SİPARİŞ // ÇAĞRI TANINDI & FİŞ BASILDI',
    tagline: 'Telefon çaldığı an müşteri ve adresi ekranda açılır, sipariş girilir, mutfak fişi basılır.',
    keyBenefit:
      'Telefon çaldığı an müşteriyi ve adresi tanır; tek tuşla mutfak fişini basar, gün sonundaki kasa açığını sıfırlar.',
    keyTags: ['Telefon Çaldığı An Müşteri ve Adresi Ekranda', 'Tek Tuşla Otomatik Mutfak ve Paket Fişi', 'Açık Vermeyen Kasa'],
    targetAudience:
      'Paket servis, masa ve gel-al hizmeti veren bağımsız restoranlar, kafeler ve çok şubeli gıda işletmeleri.',
    problemSolved:
      'Telefon çaldığında adresi tekrar sorma mecburiyetini, mutfak ile kasa arasındaki kâğıt kayıplarını ve gün sonundaki kasa açıklarını ortadan kaldırır.',
    descriptionShort:
      'Telefon çaldığı an müşteri ve adresi ekranda açılır. Tek tuşla otomatik mutfak ve paket fişi basılır, gün sonu kasa hesabı kuruşu kuruşuna tek tuşla kapanır.',
    descriptionLong: `Regon POS (eski adıyla Mergen POS), restoranların en yoğun saatlerinde hatasız ve hızlı operasyon yürütmesi için sahada bizzat geliştirilmiş dokunmatik kasa ve sipariş sistemidir.

Müşteri aradığında çalan numaradan müşteri ve adresi anında ekranda belirir, önceki siparişleri açılır. Paket, masa ve gel-al siparişleri tek dokunuşla ayrışır. Tek tuşla mutfağa hazırlık fişini, kasaya ise paket adisyonunu döker. Nakit, banka kartı ve çevrimiçi yemek platformu ödemeleri tek bir kasa havuzunda toplanır.`,
    features: [
      { icon: 'Phone', label: 'Telefon Çaldığı An Müşteri ve Adresi Ekranda', description: 'Telefon çaldığı anda müşteri adı, kayıtlı teslimat adresi ve geçmiş siparişleri doğrudan ekranda açılır.' },
      { icon: 'Printer', label: 'Tek Tuşla Otomatik Mutfak ve Paket Fişi', description: 'Tek tuşla mutfağa hazırlık fişi, kasaya adisyon ve kuryeye adres fişi eşzamanlı basılır.' },
      { icon: 'Terminal', label: 'Masa, Paket ve Gel-Al Ayrımı', description: 'Farklı satış modelleri tek ekranda ayrışır. Masalar parçalı adisyonla kapatılabilir.' },
      { icon: 'Branch', label: 'Tüm Şubeler Tek Ekranda', description: 'Birden fazla şubeye sahip restoranlar için menüler ve şube kasaları tek merkezden yönetilir.' },
      { icon: 'Reconciliation', label: 'Kasa Tahsilat Havuzu', description: 'Nakit, banka POS cihazları ve yemek kartı ödemeleri tek kasa havuzunda toplanır, açık vermez.' },
    ],
    workflowSteps: [
      { step: '1', title: 'Telefon Çaldığı An Müşteri Ekranda', desc: 'Telefon çaldığı an müşterinin adı, adresi ve geçmiş siparişi doğrudan ekrana gelir.' },
      { step: '2', title: 'Sipariş Girilir', desc: 'Masa, paket veya gel-al seçimiyle ürünler ve müşteri notları tek dokunuşla eklenir.' },
      { step: '3', title: 'Çift Fiş Basılır', desc: 'Yazıcı mutfağa hazırlama fişini, kasaya adisyonu ve kurye adres fişini tek seferde çıkartır.' },
      { step: '4', title: 'Gece Sonu Kasa Hesabı', desc: 'Nakit, kart ve platform tahsilatları gün sonunda kuruşu kuruşuna tek tuşla denetlenir.' },
    ],
    heroSlotNo: 8,
    detailSlotNos: [9, 10, 11, 12],
    status: 'development',
    accentColor: '#14C9BE',
    coverImagePath: '/images/projects/regon-pos/cover.webp',
    sortOrder: 2,
  },

  // ─── 3. REGON BAYİ ───
  {
    slug: 'regon-bayi',
    name: 'Regon Bayi',
    subname: 'B2B Dağıtım & Sevkiyat Koordinasyonu',
    stepNumber: '03',
    stepLabel: '03 · TEDARİK & DEPO SEVKİYATI',
    orderJourneyState: 'SİPARİŞ // BAYİ MAL TALEP ETTİ & MERKEZ SEVKİYATTA',
    tagline: 'Bayiler telefon yerine uygulama üzerinden mal talep eder, ana bayi tek merkezden kargolar.',
    keyBenefit:
      'Şubeler malı WhatsApp yerine tek tıkla ister; merkez onaylar, koli depodan barkodla hatasız çıkar.',
    keyTags: ['Tek Tıkla Mal Talebi', 'Canlı Kargo Aşamaları', 'Barkodlu Depo Sevkiyatı'],
    targetAudience:
      'Çok şubeli franchise gıda markaları, toptan hammadde ve ambalaj dağıtan ana depolar ve bayi ağları.',
    problemSolved:
      'WhatsApp üzerinden unutulan siparişleri, yanlış koli adetlerini ve "benim kargom ne zaman çıkar" telefon trafiğini tamamen ortadan kaldırır.',
    descriptionShort:
      'Her alt bayi kendi paneline girip o gün ne kadar hammadde veya ambalaj istediğini seçip gönderir. Ana bayi toplu hazırlar, depolar, kargolar; şubeler canlı aşamaları adım adım izler.',
    descriptionLong: `Regon Bayi, çok şubeli ve franchise işletmelerde mal talep ve sevkiyat koordinasyonunu kağıt ve telefon karmaşasından kurtaran toptan tedarik sistemidir.

Her alt şube kendi şifresiyle sisteme girer; koli, sos ve ambalaj ürünlerini adet bazında seçip tek tuşla merkeze gönderir. Ana bayi merkez ekranında tüm talepleri toplu görür, depolar ve sevkiyat planına alır. Sevkiyat yapıldığında barkod okutularak kargo takip kodu girilir. Bayi telefon açmadan kolisinin nerede olduğunu anlık bildirimle takip eder.`,
    features: [
      { icon: 'Branch', label: 'Tüm Şubeler Tek Ekranda', description: 'Her alt bayi kendi şifresiyle girer; sadece kendi sipariş geçmişini, carisini ve sevk durumunu görür.' },
      { icon: 'Box', label: 'Tek Tuşla Mal Talebi', description: 'Ürün kataloğundan koli veya adet bazında hızlı seçim yapılır, minimum sipariş sınırları otomatik uygulanır.' },
      { icon: 'Truck', label: 'Canlı Sevkiyat Adımları', description: 'Talep Alındı → Onaylandı → Hazırlandı → Kargoda aşamaları iki tarafa da anlık bildirimle aktarılır.' },
      { icon: 'Terminal', label: 'Barkodlu Depo Çıkışı', description: 'Depo personeli koli barkodlarını okutarak eksik veya yanlış ürün çıkış riskini sıfıra indirir.' },
    ],
    workflowSteps: [
      { step: '1', title: 'Bayi Talep Eder', desc: 'Şube kendi paneline girip ihtiyaç duyduğu koli ve ambalajı seçip tek tuşla gönderir.' },
      { step: '2', title: 'Merkez Onaylar', desc: 'Ana bayi talepleri tek ekranda görür, stok durumuna göre onaylar ve depoya iletir.' },
      { step: '3', title: 'Barkodlanır', desc: 'Depo görevlisi barkod okutarak siparişi hazırlar; bayi aşamayı canlı ekranda görür.' },
      { step: '4', title: 'Kargoya Verilir', desc: 'Kargo takip kodu sisteme girer; bayi teslimat anına kadar paketi adım adım izler.' },
    ],
    heroSlotNo: 13,
    detailSlotNos: [14, 15, 16, 17],
    status: 'development',
    accentColor: '#14C9BE',
    coverImagePath: '/images/projects/regon-bayi/cover.webp',
    sortOrder: 3,
  },

  // ─── 4. REGON MARKET ───
  {
    slug: 'regon-market',
    name: 'Regon Market',
    subname: 'İlçe Pazar Yeri & Yerel Girişimcilik Modeli',
    stepNumber: '04',
    stepLabel: '04 · İLÇE PAZAR YERİ & ESNAF',
    orderJourneyState: 'SİPARİŞ // MAHALLELİ SİPARİŞ VERDİ, ESNAF KAZANDI',
    tagline: 'Bir girişimci kendi ilçesinde bağımsız pazar yeri kurar, restoran ve marketlerden adil komisyon alır.',
    keyBenefit:
      'İlçenizdeki restoran ve esnafı tek mobil uygulamada toplayın; tekel platformlara %35 komisyon kaptırmayın.',
    keyTags: ['İlçe Pazar Yeri', 'Düşük Komisyon', 'Hazır Kurye Havuzu'],
    targetAudience:
      'Kendi ilçesinde teslimat ve sipariş ağı kurmak isteyen yerel girişimciler, esnaf kooperatifleri ve franchise işletmecileri.',
    problemSolved:
      'Dev tekel platformların %35\'i aşan komisyonlarına karşı esnafı koruyan, gelirin ilçede kalmasını sağlayan bağımsız yerel alternatif sunar.',
    descriptionShort:
      'İlçe bazlı franchise modeli. Bölgedeki restoran ve marketleri sisteme dahil edin, mobil uygulamadan sipariş alın, Regon Kurye filosuyla teslim ettirin ve adil komisyon kazanın.',
    descriptionLong: `Regon Market, yerel girişimcilere kendi ilçelerinde bağımsız bir sipariş ve teslimat pazar yeri kurma gücü veren yerel işletme yazılımıdır.

Girişimci ilçenin lisansını alır, yerel restoranları, kasapları ve fırınları sisteme dahil eder. Mahalle sakinleri mobil uygulamadan sepet oluşturup sipariş verir. Sipariş doğrudan esnafa ve bölgedeki motor kuryelere düşer. Girişimci her sipariş üzerinden adil komisyon kazanırken, esnaf tekel platformların fahiş komisyonlarından kurtulur.`,
    features: [
      { icon: 'Marketplace', label: 'İlçe Lisans Modeli', description: 'İlçe sınırları belirlenmiş bölge yetkisi. Girişimci kendi bölgesindeki restoran ve marketlerin yöneticisidir.' },
      { icon: 'Reconciliation', label: 'Esnek Komisyon Yönetimi', description: 'Restoran veya market bazında adil komisyon oranları belirlenerek yerel kârlılık korunur.' },
      { icon: 'MobileDevice', label: 'Modern Müşteri Uygulaması', description: 'Mahalle sakinlerinin kolayca sepet yaptığı ve siparişini adım adım takip ettiği mobil uygulama.' },
      { icon: 'Motorcycle', label: 'Hazır Kurye Havuzu', description: 'Market siparişleri Regon Kurye altyapısıyla doğrudan motor kuryelere yönlendirilir.' },
    ],
    workflowSteps: [
      { step: '1', title: 'İlçe Lisansı Alınır', desc: 'Girişimci kendi ilçesinin platform haklarını alır ve bölge yöneticisi olur.' },
      { step: '2', title: 'Esnaf Eklenir', desc: 'Bölgedeki restoranlar ve dükkanlar sisteme işletme olarak dahil edilir.' },
      { step: '3', title: 'Sipariş Gelir', desc: 'Mahalle sakinleri mobil uygulamadan sipariş verir; sipariş esnafa ve kuryeye düşer.' },
      { step: '4', title: 'Komisyon Hesaba', desc: 'Girişimci her siparişten komisyonunu alır, net tutar şeffaf biçimde esnafa ödenir.' },
    ],
    heroSlotNo: 18,
    detailSlotNos: [19, 20, 21, 22],
    status: 'development',
    accentColor: '#14C9BE',
    coverImagePath: '/images/projects/regon-market/cover.webp',
    sortOrder: 4,
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
