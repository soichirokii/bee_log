import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null | undefined;

export function getSupabase() {
  if (supabase !== undefined) return supabase;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    supabase = null;
    return supabase;
  }

  supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}
