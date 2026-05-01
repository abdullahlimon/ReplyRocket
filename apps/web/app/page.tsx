import Link from "next/link";

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <nav className="flex items-center justify-between py-6">
        <span className="text-xl font-bold tracking-tight">
          🚀 ReplyRocket
        </span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Get the extension
          </Link>
        </div>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          AI replies that actually sound like you.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Highlight any message in Gmail, LinkedIn, Slack, WhatsApp, X, or
          Outlook. Get three high-quality reply drafts in your voice — in
          seconds.
        </p>
        <div className="mt-10 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Install free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border px-6 py-3 font-medium hover:bg-gray-50"
          >
            Open dashboard
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Free plan: 30 replies / month. No credit card.
        </p>
      </section>

      <footer className="border-t py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} ReplyRocket
      </footer>
    </main>
  );
}
