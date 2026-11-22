#!/usr/bin/env node
/**
 * Eski tenant komutu — artık işletme aktivasyon kodu ile yönetiliyor.
 * Yerine: npm run code:create -- --project regon-pos --business "İşletme Adı"
 */

console.error(
  'tenant:create kaldırıldı. İşletme için aktivasyon kodu oluşturun:\n' +
    '  npm run code:create -- --project regon-pos --business "Örnek Restoran"',
)
process.exit(1)
