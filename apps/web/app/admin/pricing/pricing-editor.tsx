"use client";

import { useState } from "react";
import { ACCENT_CLASSES, type PlanAccent, type PricingPlan } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const ACCENTS: PlanAccent[] = [
  "brand",
  "sky",
  "violet",
  "emerald",
  "rose",
  "amber",
];

export default function PricingEditor({
  initialPlans,
}: {
  initialPlans: PricingPlan[];
}) {
  const [plans, setPlans] = useState(initialPlans);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();

  function update(id: string, patch: Partial<PricingPlan>) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(plan: PricingPlan) {
    setBusyId(plan.id);
    const res = await fetch(`/api/admin/pricing/${plan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    setBusyId(null);
    toast.push({
      variant: res.ok ? "success" : "error",
      title: res.ok ? `${plan.name} saved` : "Save failed",
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {plans.map((plan) => {
        const accent = ACCENT_CLASSES[plan.accent];
        return (
          <Card key={plan.id} className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${accent.gradient}`} />
            <CardBody className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                    {plan.id}
                  </code>
                  {plan.highlight && (
                    <Badge variant="info">Highlighted</Badge>
                  )}
                  {!plan.active && <Badge variant="warning">Hidden</Badge>}
                </div>
                <Button
                  size="sm"
                  loading={busyId === plan.id}
                  onClick={() => save(plan)}
                >
                  Save
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Display name">
                  <Input
                    value={plan.name}
                    onChange={(e) => update(plan.id, { name: e.target.value })}
                  />
                </Field>
                <Field label="Price label">
                  <Input
                    value={plan.price_label}
                    onChange={(e) =>
                      update(plan.id, { price_label: e.target.value })
                    }
                  />
                </Field>
                <Field label="Cadence">
                  <Input
                    value={plan.cadence}
                    onChange={(e) =>
                      update(plan.id, { cadence: e.target.value })
                    }
                  />
                </Field>
                <Field label="CTA text">
                  <Input
                    value={plan.cta}
                    onChange={(e) => update(plan.id, { cta: e.target.value })}
                  />
                </Field>
                <Field label="Monthly quota (blank = unlimited)">
                  <Input
                    type="number"
                    min={0}
                    value={plan.monthly_quota ?? ""}
                    onChange={(e) =>
                      update(plan.id, {
                        monthly_quota:
                          e.target.value === ""
                            ? null
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Accent color">
                  <Select
                    value={plan.accent}
                    onChange={(e) =>
                      update(plan.id, { accent: e.target.value as PlanAccent })
                    }
                  >
                    {ACCENTS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Blurb (one line)">
                  <Input
                    value={plan.blurb}
                    onChange={(e) => update(plan.id, { blurb: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Features (one per line)">
                  <Textarea
                    rows={5}
                    value={plan.features.join("\n")}
                    onChange={(e) =>
                      update(plan.id, {
                        features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>

              <div className="mt-3 flex flex-wrap gap-4">
                <Toggle
                  label="Highlight (most popular)"
                  checked={plan.highlight}
                  onChange={(v) => update(plan.id, { highlight: v })}
                />
                <Toggle
                  label="Active (shown publicly)"
                  checked={plan.active}
                  onChange={(v) => update(plan.id, { active: v })}
                />
                <Field label="Display order" className="w-24">
                  <Input
                    type="number"
                    value={plan.display_order}
                    onChange={(e) =>
                      update(plan.id, {
                        display_order: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}
