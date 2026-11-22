import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionTokenWithSecret } from '@/lib/admin-session'

/**
 * Next.js 16 Proxy — gizli admin alanı ve admin API koruması.
 * /admin giriş formu herkese açık; oturumsuz alt yollar ve API'ler engellenir.
 * Ana site / navbar / footer'da admin linki yoktur.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminApi = pathname.startsWith('/api/admin')
  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next()
  }

  // Giriş uçları serbest
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const token =
    request.cookies.get('__Host-admin_session')?.value ??
    request.cookies.get('admin_session')?.value

  const ok = verifyAdminSessionTokenWithSecret(
    token,
    process.env.ADMIN_PASSWORD ?? '',
    process.env.ACTIVATION_PEPPER ?? '',
    Date.now(),
  )

  if (ok) return NextResponse.next()

  if (isAdminApi) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
}
