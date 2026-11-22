import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { listTicketsAdmin } from '@/lib/ticket-api'
import type { TicketCategory, TicketStatus } from '@/lib/support'

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const category = (searchParams.get('category') ?? 'all') as TicketCategory | 'all'
  const status = (searchParams.get('status') ?? 'all') as TicketStatus | 'all'
  const projectId = searchParams.get('projectId') ?? 'all'

  const tickets = await listTicketsAdmin({ category, status, projectId })
  return NextResponse.json({ tickets })
}
