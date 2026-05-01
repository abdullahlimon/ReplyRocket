"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROMPTS = [
  "Paste a recent email or message you wrote to a colleague.",
  "Paste another — ideally a shorter, more casual one (Slack, DM, etc.).",
  "One more — anything you've written recently that sounds like you.",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [samples, setSamples] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setCurrent(value: string) {
    setSamples((prev) => prev.map((s, i) => (i === step ? value : s)));
  }

  function next() {
    setError(null);
    if ((samples[step] ?? "").trim().length < 20) {
      setError("Add at least a couple of sentences so we have something to learn from.");
      return;
    }
    if (step < PROMPTS.length - 1) {
      setStep(step + 1);
    } else {
      submit();
    }
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const cleaned = samples.map((s) => s.trim()).filter((s) => s.length >= 20);
    const samplesRes = await fetch("/api/voice/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples: cleaned, source: "onboarding" }),
    });
    if (!samplesRes.ok) {
      setError(await samplesRes.text());
      setSubmitting(false);
      return;
    }
    await fetch("/api/voice/rebuild", { method: "POST" });
    router.push("/dashboard?welcome=1");
  }

  function skip() {
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>Step {step + 1} of {PROMPTS.length}</span>
          <button onClick={skip} className="hover:underline">Skip for now</button>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${((step + 1) / PROMPTS.length) * 100}%` }}
          />
        </div>

        <h1 className="text-xl font-semibold">Teach ReplyRocket your voice</h1>
        <p className="mt-1 text-sm text-gray-600">{PROMPTS[step]}</p>

        <textarea
          value={samples[step] ?? ""}
          onChange={(e) => setCurrent(e.target.value)}
          rows={8}
          placeholder="Paste here..."
          className="mt-4 w-full rounded-lg border p-3 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || submitting}
            className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            onClick={next}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting
              ? "Analyzing your voice…"
              : step < PROMPTS.length - 1
                ? "Next"
                : "Finish"}
          </button>
        </div>
      </div>
    </main>
  );
}
