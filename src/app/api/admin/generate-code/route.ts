import { NextResponse } from 'next/server'
import { generateActivationCode } from '@/lib/activation-code'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }
  return NextResponse.json({ code: generateActivationCode() })
}
