import { requireAdmin } from "@/lib/auth";
import { getAllPlans } from "@/lib/pricing-server";
import PricingEditor from "./pricing-editor";

export default async function AdminPricing() {
  const session = await requireAdmin();
  if (!session) return null;
  const plans = await getAllPlans();

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing plans</h1>
        <p className="mt-1 text-sm text-gray-600">
          Edits here update the public <code>/pricing</code> page in real time.
        </p>
      </div>

      <PricingEditor initialPlans={plans} />
    </div>
  );
}
