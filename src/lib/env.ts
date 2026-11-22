import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  ACTIVATION_PEPPER: z.string().min(32, 'ACTIVATION_PEPPER must be at least 32 characters'),
  IP_HASH_SALT: z.string().min(32, 'IP_HASH_SALT must be at least 32 characters'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

/**
 * Ortam değişkenlerini ilk kullanımda doğrular; eksikse açık hata ile durur.
 * Gerçek değerler loglanmaz.
 */
export function getEnv(): Env {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors).join(', ')
    throw new Error(
      `Environment variables validation failed (${fields}). Copy .env.example to .env.local and fill server-only values.`,
    )
  }
  cached = parsed.data
  return cached
}

/** Geriye dönük erişim — getEnv() ile aynı. */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env]
  },
})
