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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
    }
    console.error('[admin/login] Ortam veya oturum hatası', error)
    return NextResponse.json(
      { error: 'Giriş hatası. Sunucu ayarlarını kontrol edin.' },
      { status: 500 },
    )
  }
}
