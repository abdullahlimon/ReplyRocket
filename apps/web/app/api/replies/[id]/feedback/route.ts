import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({ feedback: z.union([z.literal(-1), z.literal(1)]) });

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

  const { error } = await admin
    .from("replies")
    .update({ feedback: body.feedback })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
