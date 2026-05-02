"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PricingPlan } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "1";

export default function CheckoutForm({ plan }: { plan: PricingPlan }) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handlePurchase() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        checkout_url?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        toast.push({
          variant: "error",
          title: "Checkout failed",
          description: json.detail || json.error || `HTTP ${res.status}`,
        });
        return;
      }
      if (json.checkout_url) {
        // Stripe Checkout flow
        window.location.href = json.checkout_url;
        return;
      }
      toast.push({
        variant: "success",
        title: `You're on ${plan.name} 🎉`,
      });
      router.push("/dashboard?upgraded=1");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-7 space-y-3">
      {!STRIPE_ENABLED && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <strong>Alpha mode:</strong> billing is not yet live. Confirming below
          activates your plan immediately at no charge — perfect for early
          testers. Stripe will be wired up before public launch.
        </div>
      )}

      <Button
        size="lg"
        loading={submitting}
        onClick={handlePurchase}
        className="w-full"
      >
        {STRIPE_ENABLED
          ? `Pay ${plan.price_label} ${plan.cadence} →`
          : `Activate ${plan.name} (free during alpha)`}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Cancel anytime from{" "}
        <a href="/settings" className="underline">
          Settings
        </a>
        .
      </p>
    </div>
  );
}
