import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().min(1).max(40),
  price_label: z.string().min(1).max(20),
  price_cents: z.number().int().min(0).optional(),
  cadence: z.string().min(1).max(20),
  blurb: z.string().min(1).max(200),
  features: z.array(z.string().max(120)).max(20),
  cta: z.string().min(1).max(40),
  highlight: z.boolean(),
  monthly_quota: z.number().int().min(0).max(1_000_000).nullable(),
  accent: z.enum(["brand", "sky", "rose", "amber", "emerald", "violet"]),
  display_order: z.number().int(),
  active: z.boolean(),
});

export async function PUT(
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
    .from("pricing_plans")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
