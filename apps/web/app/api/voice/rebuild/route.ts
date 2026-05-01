import { NextResponse, type NextRequest } from "next/server";
import { generateJson } from "@/lib/llm";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  EXTRACT_VOICE_SYSTEM,
  buildExtractVoiceUserMessage,
} from "@/lib/prompts/extract-voice";

export const runtime = "nodejs";

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

  const { data: samples } = await admin
    .from("voice_samples")
    .select("content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!samples || samples.length === 0) {
    return NextResponse.json(
      { error: "no_samples", detail: "Add some writing samples first." },
      { status: 400 },
    );
  }

  const userMessage = buildExtractVoiceUserMessage(
    samples.map((s: { content: string }) => s.content),
  );

  let parsed: Record<string, unknown>;
  try {
    const response = await generateJson({
      system: EXTRACT_VOICE_SYSTEM,
      user: userMessage,
      max_tokens: 800,
      temperature: 0.3,
    });
    const text = response.text
      .trim()
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "");
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch (e) {
    return NextResponse.json(
      { error: "extraction_failed", detail: String(e) },
      { status: 502 },
    );
  }

  const update = {
    avg_sentence_length: numOrNull(parsed.avg_sentence_length),
    formality_score: numOrNull(parsed.formality_score),
    emoji_frequency: numOrNull(parsed.emoji_frequency),
    preferred_greeting: strOrNull(parsed.preferred_greeting),
    preferred_signoff: strOrNull(parsed.preferred_signoff),
    common_phrases: Array.isArray(parsed.common_phrases)
      ? (parsed.common_phrases as unknown[]).filter((p): p is string => typeof p === "string")
      : null,
    vocabulary_level: ["simple", "standard", "advanced"].includes(
      parsed.vocabulary_level as string,
    )
      ? (parsed.vocabulary_level as string)
      : null,
    contraction_usage: numOrNull(parsed.contraction_usage),
    paragraph_style: strOrNull(parsed.paragraph_style),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("voice_profiles")
    .update(update)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

function numOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
