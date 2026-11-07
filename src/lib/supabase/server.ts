import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { getEnv } from '@/lib/env'

/**
 * Sunucu tarafı Supabase istemcisi (service role).
 * Client Component'e import edilmez. Key asla NEXT_PUBLIC_ olmaz.
 */
export function getSupabaseServerClient() {
  const env = getEnv()
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
