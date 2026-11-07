#!/usr/bin/env node
/**
 * Aktivasyon kodunu iptal et.
 * npm run code:revoke -- --hint AB12
 * npm run code:revoke -- --id <uuid>
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
if (!flags.hint && !flags.id) {
  console.error('Hata: --hint veya --id gerekli')
  process.exit(1)
}

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let query = supabase.from('activation_codes').select('id, code_hint, status')
  if (flags.id) query = query.eq('id', flags.id)
  else query = query.eq('code_hint', flags.hint.toUpperCase())

  const { data: rows, error } = await query
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  if (!rows?.length) {
    console.error('Kod bulunamadı')
    process.exit(1)
  }
  if (rows.length > 1 && flags.hint) {
    console.error('Birden fazla kod aynı hint ile eşleşti; --id kullanın:')
    for (const r of rows) console.error(`  ${r.id} (${r.status})`)
    process.exit(1)
  }

  const target = rows[0]
  const now = new Date().toISOString()
  const { error: updError } = await supabase
    .from('activation_codes')
    .update({ status: 'revoked', revoked_at: now })
    .eq('id', target.id)

  if (updError) {
    console.error(updError.message)
    process.exit(1)
  }

  // Açık oturumları düşür
  await supabase
    .from('portal_sessions')
    .update({ revoked_at: now })
    .eq('code_id', target.id)
    .is('revoked_at', null)

  console.log(`İptal edildi: hint=${target.code_hint} id=${target.id}`)
}

main()
