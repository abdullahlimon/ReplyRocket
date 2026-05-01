import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Exchanges the PKCE code that Supabase Auth tacks onto the redirect URL
 * (after a magic-link verify or an OAuth round-trip) for a session cookie,
 * then sends the user wherever they were headed.
 *
 * This is the standard SSR auth pattern for Next.js App Router + Supabase:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  // Use the original Vercel/host origin from the request — important for
  // preview deployments that have a different URL than NEXT_PUBLIC_APP_URL.
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_code`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
