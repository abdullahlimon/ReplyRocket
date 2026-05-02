"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  GoogleIcon,
  MailIcon,
  CheckIcon,
  SparkleIcon,
  ShieldIcon,
} from "@/components/ui/icons";

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
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left: vibrant gradient panel with hero copy */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-900 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-fuchsia-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl"
        />

        <Link
          href="/"
          className="relative flex items-center gap-2 text-lg font-semibold"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xl backdrop-blur-sm">
            🚀
          </span>
          ReplyRocket
        </Link>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Reply faster,
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-pink-200 to-fuchsia-200 bg-clip-text text-transparent">
              still sound like you.
            </span>
          </h1>
          <ul className="mt-8 space-y-3 text-white/80">
            <Bullet icon={<SparkleIcon />}>
              3 drafts in seconds across 6 platforms
            </Bullet>
            <Bullet icon={<CheckIcon />}>
              Trained on samples of your own writing
            </Bullet>
            <Bullet icon={<ShieldIcon />}>
              We never read your inbox — only what you highlight
            </Bullet>
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Free during alpha · 30 replies / month
        </p>
      </aside>

      {/* Right: form panel */}
      <section className="relative flex items-center justify-center bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/60 px-6 py-12 lg:bg-gradient-to-br">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 flex items-center justify-center gap-2 text-lg font-bold tracking-tight lg:hidden"
          >
            <span>🚀</span>
            <span>ReplyRocket</span>
          </Link>

          <div className="rounded-2xl border border-gray-200/70 bg-white p-7 shadow-xl shadow-violet-900/5">
            <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-600">
              Sign in to start generating replies.
            </p>

            <button
              onClick={signInWithGoogle}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              OR
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={sendMagicLink} className="space-y-3">
              <div>
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MailIcon />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@work.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                loading={status === "sending"}
                className="w-full"
              >
                Email me a magic link
              </Button>
              {status === "sent" && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                  Magic link sent. Check your inbox.
                </p>
              )}
              {status === "error" && error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                  {error}
                </p>
              )}
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-900">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-900">
              Privacy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
        {icon}
      </span>
      <span className="text-sm">{children}</span>
    </li>
  );
}
