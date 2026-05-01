import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For trying it out.",
    features: [
      "30 replies per month",
      "All 6 platforms",
      "Voice profile from 3 samples",
      "Basic reply history",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "/ month",
    blurb: "For people who reply a lot.",
    features: [
      "Unlimited replies",
      "Voice learning from every send",
      "Per-platform default tone & goal",
      "Full searchable history",
      "Priority support",
    ],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "Contact",
    cadence: "us",
    blurb: "For sales, support, and CS teams.",
    features: [
      "Everything in Pro",
      "Shared brand voice profile",
      "Per-seat billing",
      "Admin controls + SSO",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="bg-white">
      <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span>🚀</span>
            <span>ReplyRocket</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/try" className="text-gray-600 hover:text-gray-900 px-2 py-1.5">
              Try it
            </Link>
            <Link href="/login">
              <Button size="sm">Get the extension</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing.</h1>
          <p className="mt-3 text-gray-600">
            Free to try. Upgrade when ReplyRocket starts saving you real time.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={
                "flex flex-col p-6 " +
                (tier.highlight
                  ? "border-brand-500 ring-2 ring-brand-500/20"
                  : "")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{tier.name}</h2>
                {tier.highlight && <Badge variant="info">Most popular</Badge>}
              </div>
              <p className="mt-1 text-sm text-gray-500">{tier.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                <span className="text-sm text-gray-500">{tier.cadence}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-0.5 text-brand-600">✓</span>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-6">
                <Button
                  className="w-full"
                  variant={tier.highlight ? "primary" : "outline"}
                >
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Questions? <a href="mailto:hello@replyrocket.io" className="underline">hello@replyrocket.io</a>
        </p>
      </section>
    </main>
  );
}
