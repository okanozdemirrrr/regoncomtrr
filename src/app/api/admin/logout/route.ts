import { NextRequest, NextResponse } from 'next/server'
import { clearAdminSessionCookie } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }
  await clearAdminSessionCookie()
  return NextResponse.json({ success: true })
}
