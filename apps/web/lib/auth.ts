import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

/**
 * The Chrome extension authenticates with a long-lived bearer token issued
 * by /api/auth/extension. We hash and look it up in extension_sessions.
 */
export async function authFromBearer(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;

  const tokenHash = await sha256(token);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("extension_sessions")
    .select("user_id, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error || !data || data.revoked_at) return null;

  await admin
    .from("extension_sessions")
    .update({ last_used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return { user_id: data.user_id, admin };
}

export async function sha256(input: string) {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
