import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { hashSessionToken } from '@/lib/activation-code'
import { assertSameOrigin, portalCookieName } from '@/lib/portal-security'
import { getSupabaseServerClient } from '@/lib/supabase/server'

function wantsJson(request: NextRequest) {
  return (request.headers.get('content-type') ?? '').includes('application/json')
}

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    if (wantsJson(request)) {
      return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
    }
    redirect('/portal/giris')
  }

  const cookieStore = await cookies()
  const name = portalCookieName()
  const token = cookieStore.get(name)?.value ?? cookieStore.get('portal_session')?.value

  if (token) {
    const supabase = getSupabaseServerClient()
    await supabase
      .from('portal_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('token_hash', hashSessionToken(token))
  }

  cookieStore.delete(name)
  cookieStore.delete('portal_session')

  if (wantsJson(request)) {
    return NextResponse.json({ success: true })
  }

  redirect('/portal/giris')
}
