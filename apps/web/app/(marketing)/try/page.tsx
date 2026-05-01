import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TryForm from "./try-form";

export const metadata = { title: "Try ReplyRocket — instant AI reply drafts" };

export default async function TryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span>🚀</span>
            <span>ReplyRocket</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {signedIn ? (
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Try it on a real message.
          </h1>
          <p className="mt-3 text-gray-600">
            Paste a message you&rsquo;ve received, pick how you want to reply, and watch
            three drafts appear. No install needed.
          </p>
        </div>

        <TryForm signedIn={signedIn} />
      </section>
    </main>
  );
}
