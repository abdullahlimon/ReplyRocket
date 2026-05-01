import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">
        {params.welcome
          ? `You're all set${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! 🚀`
          : `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.`}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {params.welcome
          ? "Install the extension and try it out — your voice profile is ready."
          : "Install the Chrome extension to start generating replies."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Replies generated" value={replyCount ?? 0} />
        <Stat
          label="Used this month"
          value={`${profile?.monthly_used ?? 0} / ${profile?.monthly_quota ?? 30}`}
        />
        <Stat label="Plan" value={profile?.plan ?? "free"} />
      </div>

      <div className="mt-10 rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">Connect your extension</h2>
        <p className="mt-1 text-sm text-gray-600">
          After installing, open the popup and click &ldquo;Connect&rdquo; — or visit:
        </p>
        <Link
          href="/auth/extension"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          Connect extension
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
