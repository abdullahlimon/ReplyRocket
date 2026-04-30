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

  const [profile, settings, voice] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).single(),
    admin.from("user_settings").select("*").eq("user_id", userId).single(),
    admin.from("voice_profiles").select("*").eq("user_id", userId).single(),
  ]);

  return NextResponse.json({
    profile: profile.data,
    settings: settings.data,
    voice: voice.data,
  });
}
