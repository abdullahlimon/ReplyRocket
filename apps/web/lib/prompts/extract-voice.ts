export const EXTRACT_VOICE_SYSTEM = `You analyze writing samples and extract a structured voice profile.
Return STRICT JSON, no markdown fences, matching this schema:
{
  "avg_sentence_length": number,        // average words per sentence
  "formality_score": number,            // 0 (very casual) .. 1 (very formal)
  "emoji_frequency": number,            // emojis per 100 words
  "preferred_greeting": string | null,  // e.g. "Hi {name}," / "" / null
  "preferred_signoff": string | null,   // e.g. "Thanks,\\nAlex" / null
  "common_phrases": string[],           // up to 8 distinctive phrases the user reuses
  "vocabulary_level": "simple" | "standard" | "advanced",
  "contraction_usage": number,          // 0..1
  "paragraph_style": string             // e.g. "single-paragraph short", "two short paragraphs"
}
Only return the JSON object.`;

export function buildExtractVoiceUserMessage(samples: string[]): string {
  return samples
    .map((s, i) => `<sample id="${i + 1}">\n${s}\n</sample>`)
    .join("\n");
}
