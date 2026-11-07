#!/usr/bin/env node
/**
 * Tenant oluşturma — yalnızca sunucu .env.local ile.
 * npm run tenant:create -- --name "Örnek Restoran" --email a@b.com --phone "+90..." --slug ornek
 */

import { createClient } from '@supabase/supabase-js'
import { getEnv } from '../src/lib/env'
import type { Database } from '../src/types/supabase'

function parseFlags(argv: string[]) {
  const flags: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const key = argv[i].slice(2)
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : ''
    flags[key] = value
  }
  return flags
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const flags = parseFlags(process.argv.slice(2))
const name = flags.name
if (!name) {
  console.error('Hata: --name gerekli')
  console.log(
    'Kullanım: npm run tenant:create -- --name "Örnek Restoran" --email ... --phone ... --slug ...',
  )
  process.exit(1)
}

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const slug = flags.slug || slugify(name)
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name,
      slug,
      contact_email: flags.email || null,
      contact_phone: flags.phone || null,
      is_active: true,
      metadata: {},
    })
    .select('id, name, slug, is_active')
    .single()

  if (error) {
    console.error('Tenant oluşturulamadı:', error.message)
    process.exit(1)
  }

  console.log('Tenant oluşturuldu')
  console.log(`  id:   ${data.id}`)
  console.log(`  name: ${data.name}`)
  console.log(`  slug: ${data.slug}`)
}

main()
