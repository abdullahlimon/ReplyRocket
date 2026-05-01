import { notFound } from "next/navigation";
import {
  GOAL_LABELS,
  PLATFORM_LABELS,
  TONE_LABELS,
  type Draft,
  type Goal,
  type Platform,
  type Tone,
} from "@replyrocket/shared";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HistoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reply } = await supabase
    .from("replies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!reply) notFound();

  const drafts = (reply.drafts as Draft[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="muted">{PLATFORM_LABELS[reply.platform as Platform]}</Badge>
        <Badge variant="muted">{TONE_LABELS[reply.tone as Tone]}</Badge>
        <Badge variant="muted">{GOAL_LABELS[reply.goal as Goal]}</Badge>
        <span className="ml-auto text-xs text-gray-500">
          {new Date(reply.created_at).toLocaleString()}
        </span>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Incoming
        </h2>
        <Card className="mt-2 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {reply.incoming_message}
          </pre>
        </Card>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Drafts
        </h2>
        <div className="mt-2 space-y-3">
          {drafts.map((d, i) => {
            const selected = d.id === reply.selected_draft_id;
            return (
              <Card
                key={d.id}
                className={selected ? "p-4 ring-2 ring-brand-500/40" : "p-4"}
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Draft {i + 1}</span>
                  {selected && <Badge variant="success">Inserted</Badge>}
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {d.text}
                </pre>
                {d.rationale && (
                  <p className="mt-2 text-xs italic text-gray-500">{d.rationale}</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {reply.edited_text && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Final sent
          </h2>
          <Card className="mt-2 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {reply.edited_text}
            </pre>
          </Card>
        </section>
      )}
    </div>
  );
}
