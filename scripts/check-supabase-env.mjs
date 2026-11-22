import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const raw = readFileSync('.env.local', 'utf8')
const parsed = {}
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue
  const i = line.indexOf('=')
  if (i < 0) continue
  const key = line.slice(0, i).trim()
  let val = line.slice(i + 1).trim()
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1)
  }
  parsed[key] = val
}

const url = parsed.SUPABASE_URL || ''
const anon = parsed.SUPABASE_ANON_KEY || ''
const service = parsed.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('URL:', url)
console.log('ANON len:', anon.length, 'prefix:', anon.slice(0, 12))
console.log('SERVICE len:', service.length, 'prefix:', service.slice(0, 12))
console.log('sameAsAnon:', anon.length > 0 && anon === service)
console.log('serviceLooksJwt:', service.startsWith('eyJ'))
console.log('serviceLooksSbSecret:', service.startsWith('sb_secret_'))
console.log('serviceLooksPublishable:', service.startsWith('sb_publishable_'))

async function probe(label, key) {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error, status } = await supabase.from('projects').select('slug,name').limit(1)
  if (error) {
    console.log(`${label} FAIL:`, status, error.message)
    return false
  }
  console.log(`${label} OK (rows=${data?.length ?? 0})`)
  return true
}

const anonOk = await probe('ANON', anon)
const serviceOk = await probe('SERVICE', service)

if (!serviceOk) {
  console.log(
    '\nSERVICE_ROLE reddedildi. Dashboard → Project Settings → API Keys → service_role (secret) kopyala.\nProje ref: otrjbpwirwgrxmezyuwg — eski/başka projeden key işe yaramaz.',
  )
  process.exitCode = 1
} else if (anonOk) {
  console.log('Keys look usable.')
}
