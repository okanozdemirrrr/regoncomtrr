import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkAdminPassword, setAdminSessionCookie } from '@/lib/admin-auth'
import { assertSameOrigin } from '@/lib/portal-security'

const schema = z.object({
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: 'İstek reddedildi.' }, { status: 403 })
  }

  try {
    const body = schema.parse(await request.json())
    if (!checkAdminPassword(body.password)) {
      return NextResponse.json({ error: 'Şifre hatalı.' }, { status: 401 })
    }
    await setAdminSessionCookie()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }
}
