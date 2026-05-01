"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const supabase = createClient();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const initialError = params.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    initialError ? "error" : "idle",
  );
  const [error, setError] = useState<string | null>(initialError);

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in to ReplyRocket</h1>
        <p className="mt-1 text-sm text-gray-600">
          We&rsquo;ll email you a magic link.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-6 flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          OR
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@work.com"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Email me a magic link"}
          </button>
          {status === "sent" && (
            <p className="text-sm text-green-600">
              Check your inbox for the link.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
