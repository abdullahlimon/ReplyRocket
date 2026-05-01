/**
 * Shared types + accent classes used by both server and client.
 * Server-only data fetchers live in ./pricing-server.ts.
 */
export type PlanAccent =
  | "brand"
  | "sky"
  | "rose"
  | "amber"
  | "emerald"
  | "violet";

export interface PricingPlan {
  id: string;
  name: string;
  price_label: string;
  price_cents: number;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight: boolean;
  monthly_quota: number | null;
  accent: PlanAccent;
  display_order: number;
  active: boolean;
}

export const ACCENT_CLASSES: Record<
  PlanAccent,
  { ring: string; gradient: string; text: string; bg: string }
> = {
  brand: {
    ring: "ring-brand-500/30 border-brand-500",
    gradient: "from-brand-500 to-brand-700",
    text: "text-brand-700",
    bg: "bg-brand-50",
  },
  sky: {
    ring: "ring-sky-500/30 border-sky-500",
    gradient: "from-sky-500 to-blue-600",
    text: "text-sky-700",
    bg: "bg-sky-50",
  },
  rose: {
    ring: "ring-rose-500/30 border-rose-500",
    gradient: "from-rose-500 to-pink-600",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
  amber: {
    ring: "ring-amber-500/30 border-amber-500",
    gradient: "from-amber-500 to-orange-600",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  emerald: {
    ring: "ring-emerald-500/30 border-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  violet: {
    ring: "ring-violet-500/30 border-violet-500",
    gradient: "from-violet-500 to-purple-600",
    text: "text-violet-700",
    bg: "bg-violet-50",
  },
};
