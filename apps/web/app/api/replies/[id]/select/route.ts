import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  draft_id: z.string().min(1),
  edited_text: z.string().max(20000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieAuth = await createClient();
  const {
    data: { user },
  } = await cookieAuth.auth.getUser();

  let userId: string;
  let admin = createAdminClient();
  if (user) {
    userId = user.id;
  } else {
    const bearer = await authFromBearer(req);
    if (!bearer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    userId = bearer.user_id;
    admin = bearer.admin;
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "invalid_body", detail: String(e) }, { status: 400 });
  }

  const { data: reply, error: lookupErr } = await admin
    .from("replies")
    .select("platform")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  if (!reply) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await admin
    .from("replies")
    .update({
      selected_draft_id: body.draft_id,
      edited_text: body.edited_text ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId);

  // Feed the inserted/edited text back into voice_samples for learning.
  if (body.edited_text && body.edited_text.trim().length > 20) {
    await admin.from("voice_samples").insert({
      user_id: userId,
      source: "edited_draft",
      platform: reply.platform,
      content: body.edited_text,
    });
  }

  await admin.from("usage_events").insert({
    user_id: userId,
    event_type: "insert",
    meta: { reply_id: id, draft_id: body.draft_id },
  });

  return NextResponse.json({ ok: true });
}
