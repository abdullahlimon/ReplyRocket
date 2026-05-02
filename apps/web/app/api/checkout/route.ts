import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  plan_id: z.string().min(1).max(40),
});

const STRIPE_ENABLED = process.env.STRIPE_SECRET_KEY ? true : false;

export async function POST(req: NextRequest) {
  const cookieAuth = await createClient();
  const {
    data: { user },
  } = await cookieAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(e) },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: plan, error: planErr } = await admin
    .from("pricing_plans")
    .select("*")
    .eq("id", body.plan_id)
    .eq("active", true)
    .maybeSingle();
  if (planErr || !plan) {
    return NextResponse.json({ error: "plan_not_found" }, { status: 404 });
  }
  if (plan.id === "free") {
    return NextResponse.json({ error: "no_purchase_needed" }, { status: 400 });
  }

  // ---- Stripe path (when STRIPE_SECRET_KEY is present) ----
  if (STRIPE_ENABLED) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        detail:
          "STRIPE_SECRET_KEY is set, but Stripe Checkout creation isn't wired up yet. Add a price ID per plan and a /api/stripe/webhook to flip the plan on checkout.session.completed.",
      },
      { status: 501 },
    );
  }

  // ---- Alpha-mode path: instantly upgrade. Role stays 'user'. ----
  const newQuota = plan.monthly_quota ?? 1_000_000;
  const { error: updErr } = await admin
    .from("profiles")
    .update({
      plan: plan.id,
      monthly_quota: newQuota,
    })
    .eq("id", user.id);
  if (updErr) {
    return NextResponse.json(
      { error: "upgrade_failed", detail: updErr.message },
      { status: 500 },
    );
  }

  await admin.from("usage_events").insert({
    user_id: user.id,
    event_type: "upgrade",
    meta: { plan: plan.id, mode: "alpha" },
  });

  return NextResponse.json({ ok: true, plan: plan.id });
}
