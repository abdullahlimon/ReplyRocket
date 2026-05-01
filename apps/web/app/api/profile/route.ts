import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { authFromBearer } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z.object({
  full_name: z.string().min(1).max(120).nullable().optional(),
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

export async function PATCH(req: NextRequest) {
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

  const { data, error } = await auth.admin
    .from("profiles")
    .update(body)
    .eq("id", auth.userId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const auth = await resolveAuth(req);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Cascade-delete via auth.admin.deleteUser() — the FK ON DELETE CASCADE on
  // profiles.id (and everything referencing profiles.id) wipes the rest.
  const { error } = await auth.admin.auth.admin.deleteUser(auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort sign-out (only matters for cookie session).
  const cookieAuth = await createClient();
  await cookieAuth.auth.signOut();

  return NextResponse.json({ ok: true });
}
