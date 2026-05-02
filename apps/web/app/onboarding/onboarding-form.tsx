"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const PROMPTS = [
  {
    title: "A work email or DM",
    body: "Paste a recent message you wrote to a colleague or contact. The longer, the better.",
  },
  {
    title: "Something casual",
    body: "Paste a shorter, more casual message — Slack, WhatsApp, a friendly email.",
  },
  {
    title: "One more",
    body: "Anything else you've written recently that sounds like you.",
  },
];

export default function OnboardingForm() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [samples, setSamples] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);

  const current = samples[step] ?? "";

  function setCurrent(value: string) {
    setSamples((prev) => prev.map((s, i) => (i === step ? value : s)));
  }

  function next() {
    if (current.trim().length < 20) {
      toast.push({
        variant: "error",
        title: "Add a bit more",
        description: "At least a couple of sentences so we have something to learn from.",
      });
      return;
    }
    if (step < PROMPTS.length - 1) setStep(step + 1);
    else submit();
  }

  async function submit() {
    setSubmitting(true);
    const cleaned = samples.map((s) => s.trim()).filter((s) => s.length >= 20);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples: cleaned }),
    });
    if (!res.ok) {
      setSubmitting(false);
      toast.push({
        variant: "error",
        title: "Couldn't save samples",
        description: await res.text(),
      });
      return;
    }
    // Fire-and-forget: voice rebuild can run while user lands on the dashboard.
    void fetch("/api/voice/rebuild", { method: "POST" });
    router.push("/dashboard?welcome=1");
    router.refresh();
  }

  async function skip() {
    setSubmitting(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: true }),
    });
    router.push("/dashboard?welcome=1");
    router.refresh();
  }

  const prompt = PROMPTS[step]!;

  return (
    <main className="hero-bg flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-xl shadow-xl shadow-violet-900/5">
        <CardBody className="p-8">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>Step {step + 1} of {PROMPTS.length}</span>
            <button onClick={skip} className="hover:text-gray-900">
              Skip for now
            </button>
          </div>

          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-brand-500 transition-all"
              style={{ width: `${((step + 1) / PROMPTS.length) * 100}%` }}
            />
          </div>

          <h1 className="mt-6 text-xl font-semibold tracking-tight">
            Teach ReplyRocket your voice
          </h1>
          <p className="mt-1 text-sm text-gray-600">{prompt.body}</p>

          <Textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            rows={9}
            placeholder="Paste here..."
            className="mt-5 font-mono"
          />

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0 || submitting}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-40"
            >
              ← Back
            </button>
            <Button onClick={next} loading={submitting}>
              {step < PROMPTS.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
