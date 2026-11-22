import 'server-only'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { safeEqualString } from '@/lib/activation-code'
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
  verifyAdminSessionTokenWithSecret,
} from '@/lib/admin-session'
import { getEnv } from '@/lib/env'

export { ADMIN_COOKIE_NAME }

export function checkAdminPassword(input: string): boolean {
  const { ADMIN_PASSWORD } = getEnv()
  return safeEqualString(input, ADMIN_PASSWORD)
}

export function verifyAdminSessionToken(token: string | undefined | null, now: number): boolean {
  const env = getEnv()
  return verifyAdminSessionTokenWithSecret(
    token,
    env.ADMIN_PASSWORD,
    env.ACTIVATION_PEPPER,
    now,
  )
}

export async function isAdminAuthenticated(): Promise<boolean> {
  await connection()
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSessionToken(token, Date.now())
}

export async function setAdminSessionCookie(): Promise<void> {
  await connection()
  const env = getEnv()
  const cookieStore = await cookies()
  const token = createAdminSessionToken(env.ADMIN_PASSWORD, env.ACTIVATION_PEPPER, Date.now())
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  })
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  cookieStore.delete('admin_session')
}
