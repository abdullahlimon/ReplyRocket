import { useEffect, useState } from "react";
import {
  GOALS,
  GOAL_LABELS,
  TONES,
  TONE_LABELS,
  type Draft,
  type Goal,
  type Platform,
  type Tone,
} from "@replyrocket/shared";
import { sendBg, type Reply } from "~lib/messaging";
import { KEYS, storage } from "~lib/storage";

interface Props {
  incoming: string;
  platform: Platform;
  threadContext?: string;
  anchor: { top: number; left: number };
  onClose: () => void;
  onInsert: (text: string) => void;
}

export function Popover({
  incoming,
  platform,
  threadContext,
  anchor,
  onClose,
  onInsert,
}: Props) {
  const [tone, setTone] = useState<Tone>("friendly");
  const [goal, setGoal] = useState<Goal>("follow_up");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const lastTone = await storage.get<Tone>(KEYS.LAST_TONE);
      const lastGoal = await storage.get<Goal>(KEYS.LAST_GOAL);
      if (lastTone) setTone(lastTone);
      if (lastGoal) setGoal(lastGoal);
      const session = await sendBg<{ signedIn: boolean }>({ type: "GET_SESSION" });
      setSignedIn(session.ok ? session.data.signedIn : false);
    })();
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setDrafts(null);
    await storage.set(KEYS.LAST_TONE, tone);
    await storage.set(KEYS.LAST_GOAL, goal);

    const res: Reply<{ reply_id: string; drafts: Draft[] }> = await sendBg({
      type: "GENERATE_REPLY",
      payload: {
        incoming_message: incoming,
        platform,
        tone,
        goal,
        thread_context: threadContext,
      },
    });
    setLoading(false);
    if (!res.ok) {
      setError(prettyError(res.error));
      return;
    }
    setDrafts(res.data.drafts);
    setReplyId(res.data.reply_id);
  }

  async function pick(d: Draft) {
    if (replyId) {
      void sendBg({
        type: "INSERT_FEEDBACK",
        payload: { reply_id: replyId, draft_id: d.id, edited_text: d.text },
      });
    }
    onInsert(d.text);
  }

  return (
    <div
      style={{ position: "absolute", top: anchor.top, left: anchor.left, zIndex: 2147483647 }}
      className="rr-pop"
    >
      <div className="rr-head">
        <span className="rr-title">🚀 ReplyRocket</span>
        <button onClick={onClose} className="rr-x" aria-label="Close">
          ×
        </button>
      </div>

      {signedIn === false ? (
        <div className="rr-body">
          <p className="rr-muted">Sign in to generate replies.</p>
          <button
            className="rr-primary"
            onClick={() => sendBg({ type: "SIGN_IN" })}
          >
            Sign in
          </button>
        </div>
      ) : (
        <div className="rr-body">
          <Row label="Tone">
            {TONES.map((t) => (
              <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                {TONE_LABELS[t]}
              </Chip>
            ))}
          </Row>
          <Row label="Goal">
            {GOALS.filter((g) => g !== "custom").map((g) => (
              <Chip key={g} active={goal === g} onClick={() => setGoal(g)}>
                {GOAL_LABELS[g]}
              </Chip>
            ))}
          </Row>

          <button
            className="rr-primary"
            disabled={loading}
            onClick={generate}
          >
            {loading ? "Generating…" : drafts ? "Regenerate" : "Generate 3 replies"}
          </button>

          {error && <div className="rr-error">{error}</div>}

          {drafts && (
            <div className="rr-drafts">
              {drafts.map((d) => (
                <div key={d.id} className="rr-draft">
                  <pre className="rr-draft-text">{d.text}</pre>
                  {d.rationale && <div className="rr-rationale">{d.rationale}</div>}
                  <div className="rr-actions">
                    <button className="rr-mini-primary" onClick={() => pick(d)}>
                      Insert
                    </button>
                    <button
                      className="rr-mini"
                      onClick={() => navigator.clipboard.writeText(d.text)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rr-row">
      <div className="rr-label">{label}</div>
      <div className="rr-chips">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={"rr-chip" + (active ? " rr-chip-active" : "")}
    >
      {children}
    </button>
  );
}

function prettyError(s: string) {
  if (s.includes("402") || s.includes("quota_exceeded"))
    return "You've hit your monthly limit. Upgrade or wait for reset.";
  if (s.includes("401") || s.includes("not_signed_in"))
    return "Please sign in from the popup.";
  return "Something went wrong. Try again.";
}

const styles = `
.rr-pop {
  width: 380px;
  max-width: 92vw;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #111;
  overflow: hidden;
}
.rr-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-bottom: 1px solid #f1f1f1;
}
.rr-title { font-weight: 600; font-size: 13px; }
.rr-x { background: transparent; border: 0; font-size: 18px; cursor: pointer; color: #6b7280; }
.rr-body { padding: 12px 14px 14px; }
.rr-row { margin-bottom: 10px; }
.rr-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; letter-spacing: 0.04em; }
.rr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.rr-chip {
  font-size: 12px; padding: 4px 9px; border-radius: 999px;
  background: #f3f4f6; border: 1px solid transparent; cursor: pointer; color: #374151;
}
.rr-chip-active { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
.rr-primary {
  width: 100%; margin-top: 6px;
  background: #4f46e5; color: #fff; border: 0; border-radius: 8px;
  padding: 9px; font-weight: 600; font-size: 13px; cursor: pointer;
}
.rr-primary:disabled { opacity: 0.6; }
.rr-error { color: #b91c1c; font-size: 12px; margin-top: 8px; }
.rr-muted { color: #6b7280; font-size: 13px; margin-bottom: 8px; }
.rr-drafts { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; }
.rr-draft { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
.rr-draft-text { white-space: pre-wrap; font-family: inherit; font-size: 13px; margin: 0; line-height: 1.45; }
.rr-rationale { font-size: 11px; color: #6b7280; margin-top: 6px; font-style: italic; }
.rr-actions { display: flex; gap: 6px; margin-top: 8px; }
.rr-mini, .rr-mini-primary {
  font-size: 12px; padding: 4px 9px; border-radius: 6px; cursor: pointer;
}
.rr-mini { background: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; }
.rr-mini-primary { background: #4f46e5; color: #fff; border: 0; }
`;
