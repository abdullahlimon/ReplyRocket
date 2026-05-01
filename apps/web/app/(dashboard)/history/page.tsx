import Link from "next/link";
import { PLATFORM_LABELS, TONE_LABELS, GOAL_LABELS } from "@replyrocket/shared";
import type { Platform, Tone, Goal } from "@replyrocket/shared";
import { createClient } from "@/lib/supabase/server";

interface HistoryRow {
  id: string;
  platform: string;
  tone: string;
  goal: string;
  incoming_message: string;
  created_at: string;
  selected_draft_id: string | null;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: replies } = await supabase
    .from("replies")
    .select("id, platform, tone, goal, incoming_message, created_at, selected_draft_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Reply history</h1>
      <p className="mt-1 text-sm text-gray-600">
        Your last 50 generated replies.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {(replies ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No replies yet. Install the extension and try it out.
          </div>
        ) : (
          <ul className="divide-y">
            {(replies as HistoryRow[]).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/history/${r.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {PLATFORM_LABELS[r.platform as Platform]} ·{" "}
                      {TONE_LABELS[r.tone as Tone]} ·{" "}
                      {GOAL_LABELS[r.goal as Goal]}
                    </span>
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <div className="line-clamp-2 text-sm text-gray-800">
                    {r.incoming_message}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
