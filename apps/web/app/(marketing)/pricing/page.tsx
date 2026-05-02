import Link from "next/link";
import { ACCENT_CLASSES } from "@/lib/pricing";
import { getActivePlans } from "@/lib/pricing-server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await getActivePlans();

  return (
    <main className="mesh-bg">
      <header className="sticky top-0 z-30 border-b border-violet-100/60 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span>🚀</span>
            <span>ReplyRocket</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/try" className="px-2 py-1.5 text-gray-600 hover:text-gray-900">
              Try it
            </Link>
            <Link href="/login">
              <Button size="sm">Get the extension</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="text-center">
            <Badge variant="info" className="mb-4">
              Free tier · No card required
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Simple pricing.</h1>
            <p className="mt-3 text-gray-600">
              Free to try. Upgrade when ReplyRocket starts saving you real time.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const accent = ACCENT_CLASSES[plan.accent];
              return (
                <Card
                  key={plan.id}
                  className={
                    "relative flex flex-col overflow-hidden p-0 " +
                    (plan.highlight ? `ring-2 ${accent.ring}` : "")
                  }
                >
                  <div className={`h-1.5 bg-gradient-to-r ${accent.gradient}`} />
                  {plan.highlight && (
                    <Badge
                      variant="info"
                      className="absolute right-4 top-4 capitalize"
                    >
                      Most popular
                    </Badge>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{plan.blurb}</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {plan.price_label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {plan.cadence}
                      </span>
                    </div>
                    <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <span className={`mt-0.5 ${accent.text}`}>✓</span>
                          <span className="text-gray-700">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/login" className="mt-6">
                      <Button
                        className="w-full"
                        variant={plan.highlight ? "primary" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Questions?{" "}
            <a href="mailto:hello@replyrocket.io" className="underline">
              hello@replyrocket.io
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
