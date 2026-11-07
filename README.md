# Regon Teknoloji — regon.com.tr

Regon Teknoloji (eski adıyla Mergen Teknoloji) kurumsal web sitesi ve müşteri portalı.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · GSAP · Lenis

---

## Kurulum

```bash
npm install
cp .env.example .env.local
# .env.local: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
# ACTIVATION_PEPPER (>=32), IP_HASH_SALT (>=32) — hepsi sunucu tarafı; NEXT_PUBLIC_ yapma
npm run dev
```

---

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Prodüksiyon |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest birim testleri |
| `npm run tenant:create` | Tenant oluştur (CLI) |
| `npm run code:create` | Aktivasyon kodu üret (bir kez yazdırır) |
| `npm run code:revoke` | Kodu iptal et (`--hint` veya `--id`) |
| `npm run code:list` | Tenant kodlarını listele (hash yok) |

### Örnek CLI

```bash
npm run tenant:create -- --name "Örnek Restoran" --email ornek@firma.com --phone "+905551112233" --slug ornek-restoran
npm run code:create -- --tenant ornek-restoran --projects regon-pos,regon-kurye --expires 365d --note "Pilotik kurulum"
npm run code:list -- --tenant ornek-restoran
npm run code:revoke -- --hint AB12
```

---

## Veritabanı (Aşama 4)

Migration dosyaları: `supabase/migrations/`

Supabase CLI yoksa birleşik dosyayı SQL Editor'e yapıştırın:

1. Dashboard → SQL Editor
2. `supabase/combined_stage4.sql` içeriğini yapıştırıp çalıştırın
3. Tablolar + RLS (deny-all) + 4 ürün seed oluşur

CLI ile:

```bash
supabase db push
# veya sırayla migration dosyalarını uygulayın
```

**Not:** Daha önce eski v1 şeması uygulandıysa `feedbacks` sütunları farklı olabilir. Temiz proje tercih edilir; gerekirse ilgili tabloları düşürüp `combined_stage4.sql` çalıştırın.

---

## Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `SUPABASE_URL` | Proje URL (**sunucu**, `NEXT_PUBLIC_` değil) |
| `SUPABASE_ANON_KEY` | Anon key (**sunucu**) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (**sunucu**, asla client) |
| `ACTIVATION_PEPPER` | Kod HMAC pepper ≥32 |
| `IP_HASH_SALT` | IP hash tuzu ≥32 |
| `NEXT_PUBLIC_SITE_URL` | Sitemap / OG (sır değil) |

---

## Manuel portal test listesi

1. Yanlış kod → genel hata mesajı
2. Süresi dolmuş kod → aynı genel mesaj
3. İptal edilmiş kod → aynı genel mesaj
4. 5 yanlış deneme → 15 dk kilit mesajı
5. Doğru kod → `/portal`, işletme adı + bağlı projeler
6. Çıkış → cookie silinir, `/portal/giris`
7. DevTools → session cookie `HttpOnly` (prod'da `Secure`, mümkünse `__Host-`)
8. Açık oturum varken `code:revoke` → sonraki istekte oturum düşer

---

## Aşama Haritası

| Aşama | İçerik |
|---|---|
| ✅ **1–3** | İskelet, animasyon, ürün içerik, PhotoSlot, sipariş yolculuğu |
| ✅ **4** | Supabase şema, aktivasyon kodu, portal giriş/oturum iskeleti |
| 🔜 **5** | Geri bildirim formu, taleplerim (onay sonrası) |
| 🔜 **6** | Admin (Supabase Auth) |
| 🔜 **7+** | API v1, bildirimler, sert CSP |

---

## Lisans

Tescilli yazılım — Regon Teknoloji. Tüm hakları saklıdır.
