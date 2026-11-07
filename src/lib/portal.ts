import 'server-only'
import { cookies } from 'next/headers'
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
  tenantId: string
  tenantName: string
  tenantSlug: string | null
  projects: { id: string; slug: string; name: string }[]
}

export async function getPortalContext(): Promise<PortalContext | null> {
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
      'id, tenant_id, code_id, expires_at, absolute_expires_at, revoked_at, last_seen_at',
    )
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (sessionError || !session) return null

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, slug, is_active')
    .eq('id', session.tenant_id)
    .maybeSingle()

  let codeStatus: 'active' | 'revoked' | 'expired' | null = null
  if (session.code_id) {
    const { data: code } = await supabase
      .from('activation_codes')
      .select('status, expires_at')
      .eq('id', session.code_id)
      .maybeSingle()

    if (code) {
      if (code.expires_at && Date.parse(code.expires_at) < now) {
        codeStatus = 'expired'
      } else {
        codeStatus = code.status
      }
    }
  }

  const absoluteExpiresAt =
    session.absolute_expires_at ??
    new Date(Date.parse(session.expires_at)).toISOString()

  if (
    !isSessionValid({
      now,
      revokedAt: session.revoked_at,
      idleExpiresAt: session.expires_at,
      absoluteExpiresAt,
      codeStatus,
      tenantActive: Boolean(tenant?.is_active),
    })
  ) {
    return null
  }

  if (!tenant) return null

  // Boşta kalma: DB'de yenilenir. Cookie mutlak süreye kadar kalır (RSC'de set edilemez).
  const newExpires = nextIdleExpiry(now, absoluteExpiresAt)
  await supabase
    .from('portal_sessions')
    .update({
      last_seen_at: new Date(now).toISOString(),
      expires_at: newExpires.toISOString(),
    })
    .eq('id', session.id)

  let projects: PortalContext['projects'] = []
  if (session.code_id) {
    const { data: links } = await supabase
      .from('activation_code_projects')
      .select('project_id')
      .eq('code_id', session.code_id)

    const projectIds = (links ?? []).map((row) => row.project_id)
    if (projectIds.length > 0) {
      const { data: projectRows } = await supabase
        .from('projects')
        .select('id, slug, name')
        .in('id', projectIds)
      projects = projectRows ?? []
    }
  }

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    projects,
  }
}

export { SESSION_TTL }
