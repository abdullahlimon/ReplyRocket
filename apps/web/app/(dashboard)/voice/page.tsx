"use client";

import { useEffect, useState } from "react";
import type { VoiceProfile } from "@replyrocket/shared";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface Sample {
  id: string;
  source: string;
  platform: string | null;
  content: string;
  created_at: string;
}

export default function VoicePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

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
    if (items.length === 0) {
      toast.push({
        variant: "error",
        title: "No samples to add",
        description: "Each sample must be at least 10 characters. Separate samples with a blank line.",
      });
      return;
    }
    setAdding(true);
    const res = await fetch("/api/voice/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples: items, source: "manual" }),
    });
    setAdding(false);
    if (!res.ok) {
      toast.push({ variant: "error", title: "Couldn't add samples" });
      return;
    }
    toast.push({
      variant: "success",
      title: `Added ${items.length} sample${items.length === 1 ? "" : "s"}`,
      description: "Click Rebuild to update your voice profile.",
    });
    setDraft("");
    load();
  }

  async function rebuild() {
    setRebuilding(true);
    const res = await fetch("/api/voice/rebuild", { method: "POST" });
    setRebuilding(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.push({
        variant: "error",
        title: "Rebuild failed",
        description: j.detail || j.error || "Try again",
      });
      return;
    }
    toast.push({ variant: "success", title: "Voice profile updated" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voice</h1>
        <p className="mt-1 text-sm text-gray-600">
          Train ReplyRocket to write like you. Add samples; click rebuild.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add writing samples</CardTitle>
          <CardDescription>
            Paste 1–10 messages you&rsquo;ve written. Separate each with a blank line.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            placeholder="Hey Sam, just circling back on the proposal..."
            className="font-mono"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={addSamples} loading={adding} size="sm">
              Add samples
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rebuild}
              loading={rebuilding}
              disabled={samples.length === 0}
            >
              Rebuild voice profile
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Greeting" value={profile?.preferred_greeting ?? "—"} />
        <Field label="Sign-off" value={profile?.preferred_signoff ?? "—"} />
        <Field
          label="Formality"
          value={
            profile?.formality_score != null
              ? `${Math.round(profile.formality_score * 100)} / 100`
              : "—"
          }
        />
        <Field
          label="Avg sentence length"
          value={profile?.avg_sentence_length?.toFixed(1) ?? "—"}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold">Samples ({samples.length})</h2>
        {samples.length === 0 ? (
          <Card className="mt-2 p-6 text-center text-sm text-gray-500">
            No samples yet. Add a few above and click <strong>Rebuild</strong>.
          </Card>
        ) : (
          <ul className="mt-2 space-y-2">
            {samples.map((s) => (
              <Card key={s.id} className="p-4 text-sm">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{s.source}</span>
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-gray-800">{s.content}</p>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1.5 truncate font-mono text-sm">{value}</div>
    </Card>
  );
}
