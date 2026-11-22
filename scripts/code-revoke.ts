#!/usr/bin/env node
/**
 * Aktivasyon kodunu pasifleştir.
 * npm run code:revoke -- --code RGN104
 */

import { createClient } from '@supabase/supabase-js'
import { normalizeActivationCode } from '../src/lib/activation-code'
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
if (!flags.code) {
  console.error('Hata: --code gerekli')
  process.exit(1)
}

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const code = normalizeActivationCode(flags.code)
  const { data, error } = await supabase
    .from('activation_codes')
    .update({ status: 'inactive' })
    .eq('code', code)
    .select('id, code, status')
    .maybeSingle()

  if (error || !data) {
    console.error('Kod bulunamadı veya güncellenemedi')
    process.exit(1)
  }

  console.log(`${data.code} → ${data.status}`)
}

main()
