import { useEffect, useState } from "react";
import { sendBg } from "~lib/messaging";

export default function Popup() {
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await sendBg<{ signedIn: boolean; email: string | null }>({
      type: "GET_SESSION",
    });
    if (res.ok) {
      setSignedIn(res.data.signedIn);
      setEmail(res.data.email);
    }
  }

  return (
    <div style={{ width: 280, padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>🚀</span>
        <strong>ReplyRocket</strong>
      </div>

      {!signedIn ? (
        <>
          <p style={{ color: "#555", fontSize: 13, marginTop: 12 }}>
            Sign in to start generating replies in Gmail, LinkedIn, and more.
          </p>
          <button
            style={btnPrimary}
            onClick={async () => {
              await sendBg({ type: "SIGN_IN" });
              window.close();
            }}
          >
            Sign in
          </button>
        </>
      ) : (
        <>
          <p style={{ color: "#555", fontSize: 13, marginTop: 12 }}>
            Signed in as <strong>{email ?? "—"}</strong>.
          </p>
          <p style={{ color: "#555", fontSize: 12 }}>
            Highlight any message and click the 🚀 button to generate replies.
          </p>
          <button
            style={btnSecondary}
            onClick={() =>
              chrome.tabs.create({
                url: `${process.env.PLASMO_PUBLIC_API_URL}/dashboard`,
              })
            }
          >
            Open dashboard
          </button>
          <button
            style={btnGhost}
            onClick={async () => {
              await sendBg({ type: "SIGN_OUT" });
              refresh();
            }}
          >
            Sign out
          </button>
        </>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  background: "#4f46e5",
  color: "white",
  padding: "8px 12px",
  border: 0,
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  background: "#f3f4f6",
  color: "#111",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  background: "transparent",
  color: "#6b7280",
  padding: "6px 12px",
  border: 0,
  cursor: "pointer",
  fontSize: 12,
};
