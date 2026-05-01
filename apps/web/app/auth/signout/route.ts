import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL(req.url);
  return NextResponse.redirect(`${url.origin}/`, { status: 303 });
}
