import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Install — ReplyRocket" };

export default function InstallPage() {
  return (
    <main className="hero-bg min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Home
        </Link>

        <div className="mt-4 text-center">
          <Badge variant="info">🚧 Alpha</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Install the extension
          </h1>
          <p className="mt-2 text-gray-600">
            ReplyRocket is in private alpha. Until we&rsquo;re on the Chrome
            Web Store, install it manually — it takes ~30 seconds.
          </p>
        </div>

        <Card className="mt-8 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500" />

          <div className="p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Quick install</h2>
                <p className="text-sm text-gray-600">
                  Three clicks. Works on Chrome, Edge, Brave, Arc.
                </p>
              </div>
              <a href="/replyrocket-extension.zip" download>
                <Button size="lg">⬇ Download .zip</Button>
              </a>
            </div>

            <ol className="mt-6 space-y-4 text-sm text-gray-700">
              <Step n={1}>
                <strong>Download the .zip</strong> using the button above and
                <strong> unzip</strong> it (it expands to a folder called
                <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">
                  chrome-mv3-prod
                </code>
                ).
              </Step>
              <Step n={2}>
                Open{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5">
                  chrome://extensions
                </code>{" "}
                in your browser.
              </Step>
              <Step n={3}>
                Toggle <strong>Developer mode</strong> on (top-right corner).
              </Step>
              <Step n={4}>
                Click <strong>Load unpacked</strong>, and pick the unzipped
                folder.
              </Step>
              <Step n={5}>
                Click the 🚀 icon in your browser toolbar →{" "}
                <strong>Sign in</strong> → finish setup.
              </Step>
              <Step n={6}>
                Open Gmail, highlight any email, click the 🚀 button next to
                your selection. Done.
              </Step>
            </ol>

            <div className="mt-7 rounded-xl bg-amber-50 p-4 text-xs text-amber-900">
              <strong>Heads up:</strong> Chrome may warn you that the extension
              is unpacked / not from the Web Store. That&rsquo;s expected during
              the alpha — accept the warning. We&rsquo;ll be on the Web Store
              shortly.
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Works on
            </p>
            <p className="mt-2">Gmail · Outlook · LinkedIn · Slack · WhatsApp · X</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Privacy
            </p>
            <p className="mt-2">
              Reads only what you highlight. We never see your inbox.
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Free tier
            </p>
            <p className="mt-2">30 replies / month. No card.</p>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white">
        {n}
      </span>
      <div className="leading-relaxed">{children}</div>
    </li>
  );
}
