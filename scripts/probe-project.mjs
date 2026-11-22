import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const raw = readFileSync('.env.local', 'utf8')
const env = {}
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue
  const i = line.indexOf('=')
  if (i < 0) continue
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}

const url = env.SUPABASE_URL
const service = env.SUPABASE_SERVICE_ROLE_KEY
console.log('URL:', url)

const supabase = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await supabase.from('projects').select('slug,name').order('name')
if (error) {
  console.log('FAIL:', error.message)
  process.exit(1)
}
console.log('OK')
for (const row of data ?? []) console.log('-', row.name)

const { count, error: codeErr } = await supabase
  .from('activation_codes')
  .select('*', { count: 'exact', head: true })
if (codeErr) console.log('activation_codes:', codeErr.message)
else console.log('activation_codes count:', count ?? 0)
