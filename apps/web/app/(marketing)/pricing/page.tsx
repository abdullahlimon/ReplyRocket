import Link from "next/link";

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
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple pricing.</h1>
        <p className="mt-3 text-gray-600">
          Free to try. Upgrade when ReplyRocket starts saving you real time.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              "flex flex-col rounded-2xl border bg-white p-6 " +
              (tier.highlight ? "border-brand-500 ring-2 ring-brand-500/20" : "")
            }
          >
            <h2 className="text-lg font-semibold">{tier.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{tier.blurb}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-sm text-gray-500">{tier.cadence}</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-brand-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className={
                "mt-6 rounded-lg px-4 py-2 text-center text-sm font-medium " +
                (tier.highlight
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border hover:bg-gray-50")
              }
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
