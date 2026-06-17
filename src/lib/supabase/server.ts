import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseBrowserConfig } from './env'

/** Supabase client for Server Components, Route Handlers and Server Actions. */
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseBrowserConfig()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component — safe to ignore; the proxy
          // refreshes the session cookie on the next request.
        }
      },
    },
  })
}
