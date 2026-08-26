import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function requireEnv(key: string): string {
  const value = typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function getAuthClient() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"));
}

/** Login with email + password. Returns access token for cookie. */
export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getAuthClient();
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return { accessToken: result.session.access_token, expiresAt: result.session.expires_at };
  });
