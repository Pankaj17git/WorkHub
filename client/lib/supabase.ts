import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create the client so builds and non-upload routes
// do not fail when Supabase env vars are not configured.
let client: SupabaseClient | null = null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      supabaseUrl,
      supabaseKey,
      { auth: { persistSession: false } }
    );
  }
  return client;
}
