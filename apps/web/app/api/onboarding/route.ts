import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  samples: z.array(z.string().min(20).max(8000)).max(20).optional(),
  skipped: z.boolean().optional(),
});

async function resolveAuth(req: NextRequest) {
  const cookieAuth = await createClient();
  const {
    data: { user },
  } = await cookieAuth.auth.getUser();
  if (user) return { userId: user.id, admin: createAdminClient() };
  const bearer = await authFromBearer(req);
  if (!bearer) return null;
  return { userId: bearer.user_id, admin: bearer.admin };
}

/**
 * Marks the user as onboarded and (optionally) saves voice samples
 * + triggers a voice rebuild. Single endpoint so the client only has
 * to call once when the user clicks Finish or Skip.
 */
export async function POST(req: NextRequest) {
  const auth = await resolveAuth(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(e) },
      { status: 400 },
    );
  }

  await auth.admin
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", auth.userId);

  if (body.samples?.length) {
    const rows = body.samples.map((content) => ({
      user_id: auth.userId,
      source: "onboarding",
      content,
    }));
    await auth.admin.from("voice_samples").insert(rows);
  }

  return NextResponse.json({ ok: true });
}
