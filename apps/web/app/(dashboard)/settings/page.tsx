"use client";

import { useEffect, useState } from "react";
import {
  GOALS,
  GOAL_LABELS,
  TONES,
  TONE_LABELS,
  type Goal,
  type Tone,
} from "@replyrocket/shared";

export default function SettingsPage() {
  const [tone, setTone] = useState<Tone>("friendly");
  const [goal, setGoal] = useState<Goal>("follow_up");
  const [insertMode, setInsertMode] = useState<"replace" | "append">("replace");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) {
          setTone(d.settings.default_tone);
          setGoal(d.settings.default_goal);
          setInsertMode(d.settings.insert_mode);
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_tone: tone,
        default_goal: goal,
        insert_mode: insertMode,
      }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-600">
        Defaults used when you open the extension.
      </p>

      <div className="mt-8 space-y-6 rounded-2xl border bg-white p-6">
        <Field label="Default tone">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {TONE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Default goal">
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as Goal)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {GOAL_LABELS[g]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Insert mode">
          <select
            value={insertMode}
            onChange={(e) =>
              setInsertMode(e.target.value as "replace" | "append")
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="replace">Replace existing draft</option>
            <option value="append">Append to existing draft</option>
          </select>
        </Field>

        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && (
          <span className="ml-2 text-sm text-green-600">Saved.</span>
        )}
        {status === "error" && (
          <span className="ml-2 text-sm text-red-600">Save failed.</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
