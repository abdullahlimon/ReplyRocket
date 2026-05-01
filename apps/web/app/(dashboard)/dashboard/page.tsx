import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { count: replyCount }, { count: sampleCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("replies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("voice_samples")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const params = await searchParams;
  if ((sampleCount ?? 0) === 0 && !params.welcome) redirect("/onboarding");

  const used = profile?.monthly_used ?? 0;
  const quota = profile?.monthly_quota ?? 30;
  const usedPct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const firstName = profile?.full_name?.split(" ")[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {params.welcome
              ? `You're all set${firstName ? `, ${firstName}` : ""}! 🚀`
              : `Welcome back${firstName ? `, ${firstName}` : ""}.`}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {params.welcome
              ? "Your voice profile is ready. Try it out below or install the extension."
              : "Quick overview of your account."}
          </p>
        </div>
        <Link href="/try">
          <Button size="md">✨ New reply</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Replies generated" value={replyCount ?? 0} />
        <Stat label="Plan" value={profile?.plan ?? "free"} badge />
        <UsageStat used={used} quota={quota} pct={usedPct} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Try it on a real message</h2>
          <p className="mt-1 text-sm text-gray-600">
            Paste a message, get three drafts in seconds. No extension needed.
          </p>
          <Link href="/try">
            <Button className="mt-4" variant="outline" size="sm">
              Open playground →
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Connect your extension</h2>
          <p className="mt-1 text-sm text-gray-600">
            After installing from the Chrome Web Store, click <em>Connect</em> in the popup.
          </p>
          <Link href="/auth/extension">
            <Button className="mt-4" size="sm">
              Connect extension
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string | number;
  badge?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </div>
      {badge ? (
        <div className="mt-2">
          <Badge variant="info" className="text-sm">
            {String(value).toUpperCase()}
          </Badge>
        </div>
      ) : (
        <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      )}
    </Card>
  );
}

function UsageStat({
  used,
  quota,
  pct,
}: {
  used: number;
  quota: number;
  pct: number;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Used this month
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums">{used}</span>
        <span className="text-sm text-gray-500">/ {quota}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
