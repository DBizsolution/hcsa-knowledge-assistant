import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. Bypasses RLS — use only on the server for
 * ingestion and trusted reads (e.g. retrieval inside the chat route).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase admin env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
