import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create the client so builds and non-upload routes
// do not fail when Supabase env vars are not configured.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return client;
}
