import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sha256 } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const cookieAuth = await createClient();
  const {
    data: { user },
  } = await cookieAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = "rr_" + base64url(tokenBytes);
  const tokenHash = await sha256(token);

  const admin = createAdminClient();
  const { error } = await admin.from("extension_sessions").insert({
    user_id: user.id,
    token_hash: tokenHash,
    user_agent: req.headers.get("user-agent") ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token, expires_at: null });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = auth.slice("Bearer ".length).trim();
  const tokenHash = await sha256(token);

  const admin = createAdminClient();
  await admin
    .from("extension_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return NextResponse.json({ ok: true });
}

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
