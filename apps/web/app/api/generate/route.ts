import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  GOALS,
  MAX_INCOMING_CHARS,
  PLATFORMS,
  TONES,
  type Draft,
} from "@replyrocket/shared";
import { generateJson } from "@/lib/llm";
import { authFromBearer } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  buildGenerateSystemPrompt,
  buildGenerateUserMessage,
} from "@/lib/prompts/generate";
import { checkAndIncrementQuota } from "@/lib/quota";

export const runtime = "nodejs";

const Body = z.object({
  incoming_message: z.string().min(1).max(MAX_INCOMING_CHARS),
  platform: z.enum(PLATFORMS),
  tone: z.enum(TONES),
  goal: z.enum(GOALS),
  custom_goal: z.string().max(200).optional(),
  thread_context: z.string().max(MAX_INCOMING_CHARS).optional(),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate (cookie session OR extension bearer token)
  let userId: string;
  let admin = createAdminClient();
  const cookieAuth = await createClient();
  const {
    data: { user },
  } = await cookieAuth.auth.getUser();

  if (user) {
    userId = user.id;
  } else {
    const bearer = await authFromBearer(req);
    if (!bearer) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    userId = bearer.user_id;
    admin = bearer.admin;
  }

  // 2. Validate body
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(e) },
      { status: 400 },
    );
  }

  // 3. Quota
  const quota = await checkAndIncrementQuota(admin, userId);
  if (!quota.ok) {
    const status = quota.reason === "quota_exceeded" ? 402 : 500;
    return NextResponse.json({ error: quota.reason }, { status });
  }

  // 4. Load voice profile + recent samples
  const [voiceRes, samplesRes, profileRes] = await Promise.all([
    admin.from("voice_profiles").select("*").eq("user_id", userId).single(),
    admin
      .from("voice_samples")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    admin.from("profiles").select("full_name").eq("id", userId).single(),
  ]);

  const firstName = profileRes.data?.full_name?.split(" ")[0] ?? null;
  const recentSamples = (samplesRes.data ?? []).map(
    (r: { content: string }) => r.content,
  );

  const system = buildGenerateSystemPrompt({
    voice: voiceRes.data ?? defaultVoice(userId),
    recent_samples: recentSamples,
    first_name: firstName,
  });
  const userMessage = buildGenerateUserMessage(body);

  // 5. Call the LLM
  let drafts: Draft[];
  let promptTokens: number | null = null;
  let completionTokens: number | null = null;
  let modelUsed = "unknown";
  try {
    const response = await generateJson({
      system,
      user: userMessage,
      max_tokens: 1024,
    });
    modelUsed = response.model;
    promptTokens = response.prompt_tokens;
    completionTokens = response.completion_tokens;
    drafts = parseDrafts(response.text);
  } catch (e) {
    return NextResponse.json(
      { error: "generation_failed", detail: String(e) },
      { status: 502 },
    );
  }

  // 6. Persist
  const { data: row, error: insertErr } = await admin
    .from("replies")
    .insert({
      user_id: userId,
      platform: body.platform,
      tone: body.tone,
      goal: body.goal,
      incoming_message: body.incoming_message,
      thread_context: body.thread_context ?? null,
      drafts,
      model: modelUsed,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    })
    .select("id")
    .single();
  if (insertErr || !row) {
    return NextResponse.json(
      { error: "persist_failed", detail: insertErr?.message },
      { status: 500 },
    );
  }

  await admin.from("usage_events").insert({
    user_id: userId,
    event_type: "generate",
    meta: { platform: body.platform, tone: body.tone, goal: body.goal },
  });

  return NextResponse.json(
    {
      reply_id: row.id,
      drafts,
      quota: { used: quota.used, quota: quota.quota },
    },
    { status: 200 },
  );
}

function parseDrafts(text: string): Draft[] {
  const trimmed = text.trim().replace(/^```(?:json)?/, "").replace(/```$/, "");
  const json = JSON.parse(trimmed) as { drafts?: unknown };
  if (!json || !Array.isArray(json.drafts) || json.drafts.length === 0) {
    throw new Error("model returned no drafts");
  }
  return json.drafts.slice(0, 3).map((d, i) => {
    const obj = d as { id?: unknown; text?: unknown; rationale?: unknown };
    return {
      id: typeof obj.id === "string" ? obj.id : String(i + 1),
      text: typeof obj.text === "string" ? obj.text : "",
      rationale: typeof obj.rationale === "string" ? obj.rationale : "",
    };
  });
}

function defaultVoice(userId: string) {
  return {
    user_id: userId,
    avg_sentence_length: null,
    formality_score: null,
    emoji_frequency: null,
    preferred_greeting: null,
    preferred_signoff: null,
    common_phrases: null,
    vocabulary_level: null,
    contraction_usage: null,
    paragraph_style: null,
    features: {},
    updated_at: new Date().toISOString(),
  };
}
