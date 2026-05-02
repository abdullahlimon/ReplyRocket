import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePlans } from "@/lib/pricing-server";
import { ACCENT_CLASSES } from "@/lib/pricing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CheckoutForm from "./checkout-form";

export const metadata = { title: "Checkout — ReplyRocket" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;
  const planId = params.plan;

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/checkout?plan=${planId ?? ""}`)}`,
    );
  }
  if (!planId) redirect("/pricing");

  const plans = await getActivePlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) redirect("/pricing");
  if (plan.id === "free") redirect("/dashboard");

  const accent = ACCENT_CLASSES[plan.accent];

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <main className="hero-bg flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to pricing
        </Link>

        <Card className="mt-4 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${accent.gradient}`} />

          <div className="p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge variant="info" className="capitalize">
                  {plan.name} plan
                </Badge>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                  Upgrade to {plan.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">{plan.blurb}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums">
                  {plan.price_label}
                </div>
                <div className="text-xs text-gray-500">{plan.cadence}</div>
              </div>
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 ${accent.text}`}>✓</span>
                  <span className="text-gray-700">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Account</span>
                <span className="font-medium">{profile?.email ?? user.email}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-500">Current plan</span>
                <span className="capitalize">{profile?.plan ?? "free"}</span>
              </div>
            </div>

            <CheckoutForm plan={plan} />
          </div>
        </Card>
      </div>
    </main>
  );
}
