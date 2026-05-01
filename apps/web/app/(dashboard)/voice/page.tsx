"use client";

import { useEffect, useState } from "react";
import type { VoiceProfile } from "@replyrocket/shared";

interface Sample {
  id: string;
  source: string;
  platform: string | null;
  content: string;
  created_at: string;
}

export default function VoicePage() {
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "rebuilding">(
    "idle",
  );

  async function load() {
    const r = await fetch("/api/voice");
    const d = (await r.json()) as { profile: VoiceProfile; samples: Sample[] };
    setProfile(d.profile);
    setSamples(d.samples);
  }

  useEffect(() => {
    load();
  }, []);

  async function addSamples() {
    const items = draft
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 10);
    if (items.length === 0) return;
    setStatus("saving");
    await fetch("/api/voice/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples: items, source: "manual" }),
    });
    setDraft("");
    setStatus("idle");
    load();
  }

  async function rebuild() {
    setStatus("rebuilding");
    await fetch("/api/voice/rebuild", { method: "POST" });
    setStatus("idle");
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Voice</h1>
      <p className="mt-1 text-sm text-gray-600">
        Add 3–5 messages you&rsquo;ve written. ReplyRocket will mirror your
        style.
      </p>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">Add samples</h2>
        <p className="mt-1 text-xs text-gray-500">
          Separate each message with a blank line.
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          placeholder="Hey Sam, just circling back..."
          className="mt-3 w-full rounded-lg border p-3 font-mono text-sm focus:border-brand-500 focus:outline-none"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={addSamples}
            disabled={status === "saving"}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {status === "saving" ? "Adding…" : "Add samples"}
          </button>
          <button
            onClick={rebuild}
            disabled={status === "rebuilding" || samples.length === 0}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {status === "rebuilding" ? "Analyzing…" : "Rebuild voice profile"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Greeting" value={profile?.preferred_greeting ?? "—"} />
        <Card title="Sign-off" value={profile?.preferred_signoff ?? "—"} />
        <Card
          title="Formality"
          value={
            profile?.formality_score != null
              ? `${Math.round(profile.formality_score * 100)} / 100`
              : "—"
          }
        />
        <Card
          title="Sentence length"
          value={profile?.avg_sentence_length?.toFixed(1) ?? "—"}
        />
      </div>

      <h2 className="mt-10 font-semibold">Samples ({samples.length})</h2>
      <ul className="mt-2 space-y-2">
        {samples.map((s) => (
          <li key={s.id} className="rounded-xl border bg-white p-3 text-sm">
            <div className="text-xs text-gray-500">
              {s.source} · {new Date(s.created_at).toLocaleDateString()}
            </div>
            <p className="mt-1 whitespace-pre-wrap">{s.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 truncate font-mono text-sm">{value}</div>
    </div>
  );
}
