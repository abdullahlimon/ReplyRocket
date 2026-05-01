// Server-only data fetchers — do NOT import from a client component.
import { createAdminClient } from "@/lib/supabase/server";
import type { PricingPlan } from "./pricing";

export async function getActivePlans(): Promise<PricingPlan[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pricing_plans")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as PricingPlan[];
}

export async function getAllPlans(): Promise<PricingPlan[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pricing_plans")
    .select("*")
    .order("display_order", { ascending: true });
  return (data ?? []) as PricingPlan[];
}
