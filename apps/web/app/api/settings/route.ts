import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { GOALS, PLATFORMS, TONES } from "@replyrocket/shared";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PerPlatform = z.record(
  z.enum(PLATFORMS),
  z
    .object({
      tone: z.enum(TONES).optional(),
      goal: z.enum(GOALS).optional(),
    })
    .optional(),
);

const Body = z
  .object({
    default_tone: z.enum(TONES).optional(),
    default_goal: z.enum(GOALS).optional(),
    per_platform_defaults: PerPlatform.optional(),
    language: z.string().min(2).max(10).optional(),
    insert_mode: z.enum(["replace", "append"]).optional(),
  })
  .strict();

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

export async function PATCH(req: NextRequest) {
  const auth = await resolveAuth(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "invalid_body", detail: String(e) }, { status: 400 });
  }

  const { data, error } = await auth.admin
    .from("user_settings")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("user_id", auth.userId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
