"use client";

import Link from "next/link";
import { useState } from "react";
import {
  GOALS,
  GOAL_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  TONES,
  TONE_LABELS,
  type Draft,
  type Goal,
  type Platform,
  type Tone,
} from "@replyrocket/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const SAMPLE_MESSAGES = [
  {
    label: "Sales follow-up",
    text: "Hey — wanted to circle back on the proposal we sent over last week. Any chance you've had a moment to look it over? Happy to jump on a quick call this week if useful.",
  },
  {
    label: "Tough decline",
    text: "Hi! Loved your work and was hoping you could help us out with a small project — basically the same scope as before but on a tighter timeline. Could you start Monday?",
  },
  {
    label: "Linkedin cold msg",
    text: "Hey, I came across your profile and noticed your background in growth. Would love to connect — we're hiring for a similar role and I think you'd be a strong fit.",
  },
];

export default function TryForm({ signedIn }: { signedIn: boolean }) {
  const toast = useToast();
  const [incoming, setIncoming] = useState(SAMPLE_MESSAGES[0]?.text ?? "");
  const [tone, setTone] = useState<Tone>("friendly");
  const [goal, setGoal] = useState<Goal>("follow_up");
  const [platform, setPlatform] = useState<Platform>("gmail");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function generate() {
    if (!signedIn) {
      window.location.href = "/login?next=/try";
      return;
    }
    if (incoming.trim().length < 10) {
      toast.push({
        variant: "error",
        title: "Message too short",
        description: "Paste at least a sentence to reply to.",
      });
      return;
    }
    setLoading(true);
    setDrafts(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incoming_message: incoming,
          platform,
          tone,
          goal,
        }),
      });
      const json = (await res.json()) as {
        drafts?: Draft[];
        error?: string;
        detail?: string;
      };
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      if (!json.drafts) throw new Error("No drafts returned");
      setDrafts(json.drafts);
    } catch (e) {
      toast.push({
        variant: "error",
        title: "Generation failed",
        description: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  function copyDraft(d: Draft) {
    navigator.clipboard.writeText(d.text);
    setCopiedId(d.id);
    toast.push({ variant: "success", title: "Copied to clipboard" });
    setTimeout(() => setCopiedId((c) => (c === d.id ? null : c)), 1500);
  }

  return (
    <div className="mt-10 grid gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="incoming" className="mb-0">
            Message you want to reply to
          </Label>
          <select
            className="text-xs text-gray-500 hover:text-gray-900"
            value=""
            onChange={(e) => {
              const sample = SAMPLE_MESSAGES.find((s) => s.label === e.target.value);
              if (sample) setIncoming(sample.text);
            }}
          >
            <option value="">Try an example…</option>
            {SAMPLE_MESSAGES.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <Textarea
          id="incoming"
          value={incoming}
          onChange={(e) => setIncoming(e.target.value)}
          rows={6}
          className="mt-2 font-mono"
          placeholder="Paste a message to reply to..."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Platform</Label>
            <Select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Tone</Label>
            <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {TONE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Goal</Label>
            <Select value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {GOALS.filter((g) => g !== "custom").map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {signedIn
              ? "Counts against your monthly quota."
              : "Sign in to generate. Free tier: 30 replies / month."}
          </p>
          <Button onClick={generate} loading={loading} size="lg">
            {drafts ? "Regenerate" : "Generate 3 replies"}
          </Button>
        </div>
      </Card>

      {loading && !drafts && (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="space-y-2">
                <div className="h-3 w-11/12 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-9/12 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-7/12 animate-pulse rounded bg-gray-100" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {drafts && (
        <div className="grid gap-3">
          {drafts.map((d, i) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  Draft {i + 1}
                </span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => copyDraft(d)}>
                    {copiedId === d.id ? "Copied ✓" : "Copy"}
                  </Button>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                {d.text}
              </pre>
              {d.rationale && (
                <p className="mt-3 text-xs italic text-gray-500">{d.rationale}</p>
              )}
            </Card>
          ))}

          <div className="mt-4 rounded-xl bg-brand-50 p-5 text-center">
            <p className="text-sm font-medium text-brand-900">
              Like what you see? Install the extension to use it inside your inbox.
            </p>
            <Link href="/login">
              <Button className="mt-3" size="md">
                Get the extension →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
