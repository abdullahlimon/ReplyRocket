import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAndIncrementQuota(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true; used: number; quota: number } | { ok: false; reason: string }> {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("monthly_used, monthly_quota, quota_reset_at")
    .eq("id", userId)
    .single();
  if (error || !profile) return { ok: false, reason: "profile_not_found" };

  if (profile.monthly_used >= profile.monthly_quota) {
    return { ok: false, reason: "quota_exceeded" };
  }

  const { data: bumped, error: incErr } = await admin.rpc("increment_usage", {
    p_user_id: userId,
  });
  if (incErr) return { ok: false, reason: incErr.message };

  const row = Array.isArray(bumped) ? bumped[0] : bumped;
  return {
    ok: true,
    used: row?.monthly_used ?? profile.monthly_used + 1,
    quota: row?.monthly_quota ?? profile.monthly_quota,
  };
}
