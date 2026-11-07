#!/usr/bin/env node
/**
 * Tenant kodlarını listele (hash göstermez).
 * npm run code:list -- --tenant <slug>
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

const flags = parseFlags(process.argv.slice(2))
if (!flags.tenant) {
  console.error('Hata: --tenant gerekli')
  process.exit(1)
}

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, slug')
    .eq('slug', flags.tenant)
    .single()

  if (tenantError || !tenant) {
    console.error('Tenant bulunamadı')
    process.exit(1)
  }

  const { data: codes, error } = await supabase
    .from('activation_codes')
    .select('id, code_hint, status, expires_at, last_used_at, created_at, note')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  console.log(`Tenant: ${tenant.name} (${tenant.slug})`)
  console.log('hint | status | expires | last_used | created | note')
  for (const c of codes ?? []) {
    console.log(
      [
        c.code_hint ?? '----',
        c.status,
        c.expires_at ?? '-',
        c.last_used_at ?? '-',
        c.created_at,
        c.note ?? '',
      ].join(' | '),
    )
  }
}

main()
