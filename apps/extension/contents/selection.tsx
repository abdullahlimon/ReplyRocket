import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
} from "plasmo";
import { useEffect, useState } from "react";
import { detectPlatform } from "~lib/adapters";
import { Popover } from "./popover";

export const config: PlasmoCSConfig = {
  matches: [
    "https://mail.google.com/*",
    "https://outlook.live.com/*",
    "https://outlook.office.com/*",
    "https://outlook.office365.com/*",
    "https://www.linkedin.com/*",
    "https://app.slack.com/*",
    "https://web.whatsapp.com/*",
    "https://x.com/*",
    "https://twitter.com/*",
  ],
  run_at: "document_idle",
  all_frames: false,
};

interface SelectionState {
  text: string;
  rect: DOMRect | null;
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => document.body;

export default function SelectionOverlay() {
  const [sel, setSel] = useState<SelectionState>({ text: "", rect: null });
  const [open, setOpen] = useState(false);
  const adapter = detectPlatform();

  useEffect(() => {
    function onUp() {
      const s = window.getSelection();
      const text = s?.toString().trim() ?? "";
      if (text.length < 10) {
        setSel({ text: "", rect: null });
        return;
      }
      const range = s?.getRangeAt(0);
      const rect = range?.getBoundingClientRect() ?? null;
      setSel({ text, rect });
    }
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
    };
  }, []);

  if (!adapter || !sel.rect || !sel.text) return null;

  const top = sel.rect.bottom + window.scrollY + 8;
  const left = sel.rect.left + window.scrollX;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "absolute",
            top,
            left,
            zIndex: 2147483646,
          }}
          className="rr-fab"
          title="Generate replies with ReplyRocket"
        >
          🚀 Reply
        </button>
      )}
      {open && (
        <Popover
          incoming={sel.text}
          platform={adapter.platform}
          threadContext={adapter.getThreadContext?.() ?? undefined}
          onClose={() => setOpen(false)}
          onInsert={(text) => {
            adapter.insertText(text);
            setOpen(false);
          }}
          anchor={{ top, left }}
        />
      )}
      <style>{`
        .rr-fab {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: #4f46e5;
          color: #fff;
          border: 0;
          border-radius: 999px;
          padding: 6px 12px;
          box-shadow: 0 6px 16px rgba(79,70,229,0.35);
          cursor: pointer;
        }
        .rr-fab:hover { background: #4338ca; }
      `}</style>
    </>
  );
}
