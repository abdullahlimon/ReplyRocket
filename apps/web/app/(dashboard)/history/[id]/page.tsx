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
    <div className="mx-auto max-w-3xl">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {PLATFORM_LABELS[reply.platform as Platform]} ·{" "}
        {TONE_LABELS[reply.tone as Tone]} · {GOAL_LABELS[reply.goal as Goal]}
      </div>

      <h2 className="mt-2 text-xl font-semibold">Incoming</h2>
      <pre className="mt-2 whitespace-pre-wrap rounded-xl border bg-white p-4 text-sm">
        {reply.incoming_message}
      </pre>

      <h2 className="mt-8 text-xl font-semibold">Drafts</h2>
      <div className="mt-3 space-y-3">
        {drafts.map((d) => {
          const selected = d.id === reply.selected_draft_id;
          return (
            <div
              key={d.id}
              className={`rounded-xl border bg-white p-4 ${
                selected ? "border-brand-500 ring-1 ring-brand-500/30" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Draft #{d.id}</span>
                {selected && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">
                    Inserted
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{d.text}</p>
              {d.rationale && (
                <p className="mt-2 text-xs italic text-gray-500">{d.rationale}</p>
              )}
            </div>
          );
        })}
      </div>

      {reply.edited_text && (
        <>
          <h2 className="mt-8 text-xl font-semibold">Final sent</h2>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl border bg-white p-4 text-sm">
            {reply.edited_text}
          </pre>
        </>
      )}
    </div>
  );
}
