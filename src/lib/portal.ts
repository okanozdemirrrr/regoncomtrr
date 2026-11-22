import 'server-only'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import {
  hashSessionToken,
  isSessionValid,
  nextIdleExpiry,
  SESSION_TTL,
} from '@/lib/activation-code'
import { portalCookieName } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const PORTAL_COOKIE_NAME = portalCookieName()

export type PortalContext = {
  sessionId: string
  activationCodeId: string
  code: string
  businessName: string
  project: { id: string; slug: string; name: string }
}

export async function getPortalContext(): Promise<PortalContext | null> {
  await connection()
  const cookieStore = await cookies()
  const name = portalCookieName()
  const token = cookieStore.get(name)?.value
  if (!token) return null

  const supabase = getSupabaseServerClient()
  const tokenHash = hashSessionToken(token)
  const now = Date.now()

  const { data: session, error: sessionError } = await supabase
    .from('portal_sessions')
    .select(
      'id, activation_code_id, expires_at, absolute_expires_at, revoked_at',
    )
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (sessionError || !session) return null

  const { data: activation } = await supabase
    .from('activation_codes')
    .select('id, code, business_name, status, project_id')
    .eq('id', session.activation_code_id)
    .maybeSingle()

  if (!activation) return null

  const absoluteExpiresAt =
    session.absolute_expires_at ??
    new Date(Date.parse(session.expires_at)).toISOString()

  if (
    !isSessionValid({
      now,
      revokedAt: session.revoked_at,
      idleExpiresAt: session.expires_at,
      absoluteExpiresAt,
      codeStatus: activation.status,
    })
  ) {
    return null
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('id', activation.project_id)
    .maybeSingle()

  if (!project) return null

  const newExpires = nextIdleExpiry(now, absoluteExpiresAt)
  await supabase
    .from('portal_sessions')
    .update({
      last_seen_at: new Date(now).toISOString(),
      expires_at: newExpires.toISOString(),
    })
    .eq('id', session.id)

  return {
    sessionId: session.id,
    activationCodeId: activation.id,
    code: activation.code,
    businessName: activation.business_name,
    project,
  }
}

export { SESSION_TTL }
