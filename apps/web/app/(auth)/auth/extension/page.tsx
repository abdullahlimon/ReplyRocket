"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExtensionAuthBridge() {
  const supabase = createClient();
  const [status, setStatus] = useState<
    "loading" | "needs_login" | "issued" | "error"
  >("loading");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setStatus("needs_login");
        return;
      }
      const res = await fetch("/api/auth/extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        setStatus("error");
        setError(await res.text());
        return;
      }
      const json = (await res.json()) as { token: string };
      setToken(json.token);
      setStatus("issued");

      const extensionId =
        new URLSearchParams(window.location.search).get("ext") ||
        process.env.NEXT_PUBLIC_EXTENSION_ID;
      if (extensionId && typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          extensionId,
          { type: "REPLYROCKET_AUTH", token: json.token },
          () => {},
        );
      }
    })();
  }, [supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {status === "loading" && <p>Connecting…</p>}
        {status === "needs_login" && (
          <>
            <h1 className="text-xl font-semibold">Sign in first</h1>
            <p className="mt-2 text-sm text-gray-600">
              Then come back to this page from the extension popup.
            </p>
            <a
              href="/login?next=/auth/extension"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
            >
              Sign in
            </a>
          </>
        )}
        {status === "issued" && (
          <>
            <h1 className="text-xl font-semibold">You&rsquo;re connected ✅</h1>
            <p className="mt-2 text-sm text-gray-600">
              You can close this tab and start using ReplyRocket.
            </p>
            {token && (
              <details className="mt-4 text-left text-xs text-gray-500">
                <summary>Show token (paste into extension if auto-link failed)</summary>
                <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2">
                  {token}
                </pre>
              </details>
            )}
          </>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}
      </div>
    </main>
  );
}
