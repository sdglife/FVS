import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key. Every DB access
 * in this app goes through server code (route handlers / server actions) —
 * the browser never gets a Supabase client, so there's no anon-key surface
 * to lock down with RLS (see the note at the top of supabase/schema.sql).
 *
 * Importing this file from client code is a bug: it reads
 * SUPABASE_SERVICE_ROLE_KEY, which Next.js will refuse to inline into a
 * client bundle anyway (it's not prefixed NEXT_PUBLIC_), so misuse fails
 * loudly rather than leaking the key.
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY (see .env.example)."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
