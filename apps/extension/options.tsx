import { useEffect, useState } from "react";
import {
  GOALS,
  GOAL_LABELS,
  TONES,
  TONE_LABELS,
  type Goal,
  type Tone,
} from "@replyrocket/shared";
import { KEYS, storage } from "~lib/storage";

export default function Options() {
  const [tone, setTone] = useState<Tone>("friendly");
  const [goal, setGoal] = useState<Goal>("follow_up");

  useEffect(() => {
    (async () => {
      const t = await storage.get<Tone>(KEYS.LAST_TONE);
      const g = await storage.get<Goal>(KEYS.LAST_GOAL);
      if (t) setTone(t);
      if (g) setGoal(g);
    })();
  }, []);

  async function save() {
    await storage.set(KEYS.LAST_TONE, tone);
    await storage.set(KEYS.LAST_GOAL, goal);
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "32px auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>ReplyRocket — defaults</h1>
      <p style={{ color: "#555" }}>
        For account-level preferences, use the{" "}
        <a href={`${process.env.PLASMO_PUBLIC_API_URL}/settings`}>web dashboard</a>.
      </p>

      <label style={{ display: "block", marginTop: 16 }}>
        <strong>Default tone</strong>
        <br />
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          style={{ marginTop: 4, padding: 6, width: "100%" }}
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {TONE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "block", marginTop: 16 }}>
        <strong>Default goal</strong>
        <br />
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value as Goal)}
          style={{ marginTop: 4, padding: 6, width: "100%" }}
        >
          {GOALS.map((g) => (
            <option key={g} value={g}>
              {GOAL_LABELS[g]}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={save}
        style={{
          marginTop: 24,
          background: "#4f46e5",
          color: "white",
          padding: "8px 16px",
          border: 0,
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
