import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z
  .object({
    plan: z.enum(["free", "pro", "team"]).optional(),
    role: z.enum(["user", "admin"]).optional(),
    monthly_quota: z.number().int().min(0).max(100000).optional(),
    monthly_used: z.number().int().min(0).optional(),
  })
  .strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(e) },
      { status: 400 },
    );
  }

  const { data, error } = await session.admin
    .from("profiles")
    .update(body)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  // Block accidentally nuking your own account through the admin UI.
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "cannot_delete_self" },
      { status: 400 },
    );
  }

  const { error } = await session.admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
