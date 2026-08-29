import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Uses service_role key for admin writes
 * and anon key for public reads. Never imported into client bundles.
 */
function requireEnv(key: string): string {
  const value = typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

/** Public read client (anon key). Used by content-source.ts. */
export function getSupabaseAnon() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"));
}

/** Admin write client (service_role key). Used by admin CRUD + image upload. */
export function getSupabaseAdmin() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
