#!/usr/bin/env node
/**
 * Aktivasyon kodu üret — kod bir kez yazdırılır.
 * npm run code:create -- --tenant <slug> --projects regon-pos,regon-kurye --expires 365d --note "..."
 */

import { createClient } from '@supabase/supabase-js'
import {
  generateActivationCode,
  getCodeHint,
  hashActivationCode,
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

function parseExpires(expires?: string): Date | null {
  if (!expires) return null
  const match = expires.match(/^(\d+)([dhm])$/)
  if (!match) return null
  const value = parseInt(match[1], 10)
  const unit = match[2]
  const now = Date.now()
  if (unit === 'd') return new Date(now + value * 86400000)
  if (unit === 'h') return new Date(now + value * 3600000)
  if (unit === 'm') return new Date(now + value * 60000)
  return null
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
    .select('id, slug, is_active')
    .eq('slug', flags.tenant)
    .single()

  if (tenantError || !tenant) {
    console.error('Tenant bulunamadı')
    process.exit(1)
  }
  if (!tenant.is_active) {
    console.error('Tenant aktif değil')
    process.exit(1)
  }

  const code = generateActivationCode()
  const codeHash = hashActivationCode(code, env.ACTIVATION_PEPPER)
  const codeHint = getCodeHint(code)
  const expiresAt = parseExpires(flags.expires)

  const { data: row, error } = await supabase
    .from('activation_codes')
    .insert({
      tenant_id: tenant.id,
      code_hash: codeHash,
      code_hint: codeHint,
      status: 'active',
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      note: flags.note || null,
    })
    .select('id')
    .single()

  if (error || !row) {
    console.error('Kod oluşturulamadı:', error?.message)
    process.exit(1)
  }

  if (flags.projects) {
    for (const projectSlug of flags.projects.split(',').map((s) => s.trim()).filter(Boolean)) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .single()
      if (project) {
        await supabase.from('activation_code_projects').insert({
          code_id: row.id,
          project_id: project.id,
        })
      } else {
        console.warn(`Uyarı: proje bulunamadı: ${projectSlug}`)
      }
    }
  }

  console.log('Aktivasyon kodu oluşturuldu. Bu kod bir daha gösterilmez:')
  console.log(code)
  console.log(`hint: ${codeHint}`)
  console.log(`id:   ${row.id}`)
  console.log(`expires: ${expiresAt ? expiresAt.toISOString() : 'yok'}`)
}

main()
