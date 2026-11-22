#!/usr/bin/env node
/**
 * Aktivasyon kodu üret (3 harf + 3 rakam).
 * npm run code:create -- --project regon-pos --business "Demo Lokanta" [--code RGN104] [--note "..."]
 */

import { createClient } from '@supabase/supabase-js'
import {
  generateActivationCode,
  isValidActivationCodeFormat,
  normalizeActivationCode,
} from '../src/lib/activation-code'
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
if (!flags.project || !flags.business) {
  console.error('Hata: --project ve --business gerekli')
  process.exit(1)
}

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('slug', flags.project)
    .single()

  if (projectError || !project) {
    console.error('Proje bulunamadı')
    process.exit(1)
  }

  let code = flags.code
    ? normalizeActivationCode(flags.code)
    : generateActivationCode()

  if (!isValidActivationCodeFormat(code)) {
    console.error('Kod biçimi geçersiz (3 harf + 3 rakam)')
    process.exit(1)
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data: row, error } = await supabase
      .from('activation_codes')
      .insert({
        code,
        project_id: project.id,
        business_name: flags.business,
        status: 'active',
        note: flags.note || null,
      })
      .select('id, code')
      .single()

    if (!error && row) {
      console.log('Aktivasyon kodu oluşturuldu:')
      console.log(row.code)
      console.log(`id: ${row.id}`)
      console.log(`project: ${project.slug}`)
      return
    }

    if (error?.code === '23505') {
      if (flags.code) {
        console.error('Bu kod zaten var')
        process.exit(1)
      }
      code = generateActivationCode()
      continue
    }

    console.error('Kod oluşturulamadı:', error?.message)
    process.exit(1)
  }

  console.error('Benzersiz kod üretilemedi')
  process.exit(1)
}

main()
