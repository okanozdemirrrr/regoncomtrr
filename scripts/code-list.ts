#!/usr/bin/env node
/**
 * Aktivasyon kodlarını listele.
 * npm run code:list
 */

import { createClient } from '@supabase/supabase-js'
import { getEnv } from '../src/lib/env'
import type { Database } from '../src/types/supabase'

async function main() {
  const env = getEnv()
  const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('activation_codes')
    .select('code, business_name, status, project_id, created_at, last_used_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  const projectIds = [...new Set((data ?? []).map((c) => c.project_id))]
  const { data: projects } = projectIds.length
    ? await supabase.from('projects').select('id, name').in('id', projectIds)
    : { data: [] as { id: string; name: string }[] }

  const map = new Map((projects ?? []).map((p) => [p.id, p.name]))

  for (const row of data ?? []) {
    console.log(
      `${row.code}\t${row.status}\t${row.business_name}\t${map.get(row.project_id) ?? '-'}\t${row.created_at}`,
    )
  }
}

main()
