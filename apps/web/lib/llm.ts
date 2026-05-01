/**
 * LLM client. Currently backed by Google Gemini (free tier via AI Studio).
 *
 * Get a free API key at https://aistudio.google.com/app/apikey
 * and set GEMINI_API_KEY in your environment.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface LLMJsonResponse {
  text: string;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
}

export async function generateJson(args: {
  system: string;
  user: string;
  max_tokens: number;
  temperature?: number;
}): Promise<LLMJsonResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const model = process.env.LLM_MODEL || "gemini-2.0-flash";

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    system_instruction: { parts: [{ text: args.system }] },
    contents: [{ role: "user", parts: [{ text: args.user }] }],
    generationConfig: {
      temperature: args.temperature ?? 0.7,
      maxOutputTokens: args.max_tokens,
      responseMimeType: "application/json",
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`gemini ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
    };
    promptFeedback?: { blockReason?: string };
  };

  if (json.promptFeedback?.blockReason) {
    throw new Error(`gemini blocked: ${json.promptFeedback.blockReason}`);
  }

  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("") ?? "";

  if (!text) {
    throw new Error("gemini returned empty response");
  }

  return {
    text,
    model,
    prompt_tokens: json.usageMetadata?.promptTokenCount ?? null,
    completion_tokens: json.usageMetadata?.candidatesTokenCount ?? null,
  };
}
