import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminOverview() {
  const session = await requireAdmin();
  if (!session) return null;

  const { admin } = session;
  const [users, replies, samples, plans, recent] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("replies").select("*", { count: "exact", head: true }),
    admin.from("voice_samples").select("*", { count: "exact", head: true }),
    admin.from("pricing_plans").select("*", { count: "exact", head: true }),
    admin
      .from("replies")
      .select("id, platform, tone, goal, created_at, model")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stats = [
    { label: "Total users", value: users.count ?? 0, accent: "from-sky-500 to-blue-600" },
    { label: "Replies generated", value: replies.count ?? 0, accent: "from-violet-500 to-purple-600" },
    { label: "Voice samples", value: samples.count ?? 0, accent: "from-emerald-500 to-teal-600" },
    { label: "Active plans", value: plans.count ?? 0, accent: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Global health of your ReplyRocket instance.
          </p>
        </div>
        <Link href="/admin/users">
          <Button>Manage users →</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden p-0">
            <div className={`h-1 bg-gradient-to-r ${s.accent}`} />
            <div className="p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {s.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {s.value.toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold">Recent generations</h2>
        <Card className="mt-3 overflow-hidden">
          {(recent.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No generations yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {(recent.data ?? []).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                      {r.platform}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                      {r.tone}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                      {r.goal}
                    </span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">
                      {r.model}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
