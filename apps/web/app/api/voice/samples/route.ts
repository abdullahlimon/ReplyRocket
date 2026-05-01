import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  samples: z.array(z.string().min(10).max(8000)).min(1).max(20),
  source: z.string().default("onboarding"),
});

export async function POST(req: NextRequest) {
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

  const rows = body.samples.map((content) => ({
    user_id: userId,
    source: body.source,
    content,
  }));
  const { error, count } = await admin
    .from("voice_samples")
    .insert(rows, { count: "exact" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: count ?? rows.length });
}
