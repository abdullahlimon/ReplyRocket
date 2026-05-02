import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PLATFORMS = [
  { name: "Gmail", emoji: "📧" },
  { name: "Outlook", emoji: "📨" },
  { name: "LinkedIn", emoji: "💼" },
  { name: "Slack", emoji: "💬" },
  { name: "WhatsApp", emoji: "🟢" },
  { name: "X / Twitter", emoji: "𝕏" },
];

const FEATURES = [
  {
    icon: "✍️",
    title: "Sounds like you",
    body: "Trains on samples of your own writing so the drafts match your voice — not a generic AI tone.",
    accent: "from-violet-500 to-indigo-600",
  },
  {
    icon: "🎯",
    title: "Tone + goal aware",
    body: "Pick the tone (Friendly, Direct, Empathetic…) and the goal (Follow up, Decline, Negotiate…). Three drafts, real choices.",
    accent: "from-rose-500 to-pink-600",
  },
  {
    icon: "⚡",
    title: "2 seconds, 3 drafts",
    body: "Highlight the message, click the rocket, get three meaningfully different replies. Insert with one click.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: "🔒",
    title: "Only what you highlight",
    body: "We never read your inbox. The extension only sees text you actively select — nothing else.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    icon: "🧠",
    title: "Learns over time",
    body: "Every reply you send through ReplyRocket sharpens your voice profile. It gets better the more you use it.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    icon: "🌐",
    title: "Six platforms",
    body: "Gmail, Outlook, LinkedIn, Slack, WhatsApp Web, and X — all with one extension.",
    accent: "from-fuchsia-500 to-purple-600",
  },
];

const FAQ = [
  {
    q: "Do you read my inbox?",
    a: "No. The extension activates only on the text you highlight and click the rocket button on. It never accesses other emails, threads, contacts, or browsing history.",
  },
  {
    q: "Which AI model do you use?",
    a: "Google Gemini 2.0 Flash by default. The architecture is provider-agnostic, so we can swap to Claude, GPT, or open-source models without changing your data.",
  },
  {
    q: "What happens to my messages?",
    a: "We store the highlighted message, the drafts, and the version you sent (so we can keep learning your voice) — all under your account, never shared, never used to train shared models.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. One click in Settings → Account permanently removes your account and every row associated with it.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. 30 replies a month, no card required. Pro is $9/mo for unlimited.",
  },
];

export default function Landing() {
  return (
    <main className="mesh-bg">
      <Nav />
      <Hero />
      <PlatformStrip />
      <DemoMockup />
      <Features />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span>🚀</span>
          <span>ReplyRocket</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/pricing" className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline px-2 py-1.5">
            Pricing
          </Link>
          <Link href="/try" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5">
            Try it
          </Link>
          <Link href="/login" className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline px-2 py-1.5">
            Sign in
          </Link>
          <Link href="/install">
            <Button size="sm">Get the extension</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden hero-bg">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <Badge variant="info" className="mb-6">
          ✨ Free during alpha · 30 replies/month
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          AI replies that{" "}
          <span className="gradient-text">actually sound like you</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          Highlight any message in Gmail, LinkedIn, Slack, WhatsApp, X, or Outlook.
          Get three high-quality reply drafts in your voice — in seconds.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/install">
            <Button size="lg">Install free</Button>
          </Link>
          <Link href="/try">
            <Button size="lg" variant="outline">
              Try without installing →
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          No credit card. Sign in with Google or magic link.
        </p>
      </div>
    </section>
  );
}

function PlatformStrip() {
  return (
    <section className="border-y border-violet-100/60 bg-white/60 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-widest text-violet-700/70">
          Works in
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PLATFORMS.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
            >
              <span className="text-lg">{p.emoji}</span>
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DemoMockup() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Highlight. Click. Insert.
      </h2>
      <p className="mt-3 text-center text-gray-600">
        See how it looks in your inbox.
      </p>

      <div className="relative mx-auto mt-12 max-w-3xl">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-2 shadow-xl">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-500">mail.google.com</span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_320px]">
              {/* Email */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Sarah Chen</p>
                    <p className="text-xs text-gray-500">to me · 9:42 AM</p>
                  </div>
                </div>
                <p className="text-gray-700">Hey — wanted to circle back on the proposal we sent over last week.</p>
                <p className="rounded-md bg-yellow-100/70 px-1 py-0.5 text-gray-900">
                  Any chance you&rsquo;ve had a moment to look it over? Happy to jump on a quick call this week if useful.
                </p>
                <p className="text-gray-700">Thanks!<br />Sarah</p>
              </div>

              {/* Popover */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-md">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                  <span className="text-sm font-semibold">🚀 ReplyRocket</span>
                  <span className="text-gray-400">×</span>
                </div>
                <div className="space-y-3 p-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Tone</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {["Friendly", "Direct", "Concise"].map((t, i) => (
                        <span
                          key={t}
                          className={
                            "rounded-full px-2 py-0.5 text-[11px] " +
                            (i === 0
                              ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                              : "bg-gray-100 text-gray-600")
                          }
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">Goal</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {["Request meeting", "Follow up"].map((t, i) => (
                        <span
                          key={t}
                          className={
                            "rounded-full px-2 py-0.5 text-[11px] " +
                            (i === 0
                              ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                              : "bg-gray-100 text-gray-600")
                          }
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border border-gray-100 bg-gray-50/60 p-2.5 text-xs text-gray-700">
                    Hi Sarah — thanks for the nudge! I just blocked off Thursday afternoon to read through it properly. How about a 20-min call Friday at 11?
                  </div>
                  <div className="flex gap-1.5">
                    <button className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white">
                      Insert
                    </button>
                    <button className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px]">
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight">Built for messages you&rsquo;d actually send.</h2>
        <p className="mt-3 text-gray-600">
          Most AI replies sound robotic. ReplyRocket sounds like you — because it learns from you.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title} className="overflow-hidden p-0 transition-transform hover:-translate-y-0.5">
            <div className={`h-1 bg-gradient-to-r ${f.accent}`} />
            <div className="p-6">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} text-xl text-white shadow-sm`}>
                {f.icon}
              </div>
              <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{f.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Frequently asked.
      </h2>
      <dl className="mt-10 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-900">
              {item.q}
              <span className="text-gray-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-gray-600">{item.a}</p>
          </details>
        ))}
      </dl>
    </section>
  );
}

function Cta() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to reply faster?</h2>
        <p className="mt-2 text-white/80">
          Free to start. 30 replies / month. Setup takes 60 seconds.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/install">
            <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-white/90">
              Get the extension
            </Button>
          </Link>
          <Link href="/try">
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
              Try it first →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} ReplyRocket</span>
        <div className="flex flex-wrap gap-5">
          <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
          <Link href="/try" className="hover:text-gray-900">Try it</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
