import { NextResponse, type NextRequest } from "next/server";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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

  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get("limit") ?? 20));
  const cursor = url.searchParams.get("cursor");
  const platform = url.searchParams.get("platform");

  let q = admin
    .from("replies")
    .select(
      "id, platform, tone, goal, incoming_message, drafts, selected_draft_id, edited_text, feedback, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (platform) q = q.eq("platform", platform);
  if (cursor) q = q.lt("created_at", cursor);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).slice(0, limit);
  const next_cursor =
    data && data.length > limit ? items[items.length - 1]?.created_at : null;

  return NextResponse.json({ items, next_cursor });
}
