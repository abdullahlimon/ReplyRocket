import Link from "next/link";
import { GOAL_LABELS, PLATFORM_LABELS, TONE_LABELS } from "@replyrocket/shared";
import type { Goal, Platform, Tone } from "@replyrocket/shared";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    .select(
      "id, platform, tone, goal, incoming_message, created_at, selected_draft_id",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (replies as HistoryRow[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reply history</h1>
        <p className="mt-1 text-sm text-gray-600">Your last 50 generated replies.</p>
      </div>

      {items.length === 0 ? (
        <Card className="mt-6 p-10 text-center">
          <span className="text-3xl">📭</span>
          <h2 className="mt-3 text-base font-semibold">No replies yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate one in the playground or install the extension.
          </p>
          <Link href="/try">
            <Button className="mt-4" size="sm">
              Open playground
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="mt-6 divide-y divide-gray-100 overflow-hidden">
          {items.map((r) => (
            <Link
              key={r.id}
              href={`/history/${r.id}`}
              className="block px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <Badge variant="muted">{PLATFORM_LABELS[r.platform as Platform]}</Badge>
                <Badge variant="muted">{TONE_LABELS[r.tone as Tone]}</Badge>
                <Badge variant="muted">{GOAL_LABELS[r.goal as Goal]}</Badge>
                {r.selected_draft_id && <Badge variant="success">Sent</Badge>}
                <span className="ml-auto">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-gray-800">
                {r.incoming_message}
              </p>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
