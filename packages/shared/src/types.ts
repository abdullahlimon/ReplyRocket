import type { GOALS, PLATFORMS, TONES } from "./constants";

export type Tone = (typeof TONES)[number];
export type Goal = (typeof GOALS)[number];
export type Platform = (typeof PLATFORMS)[number];

export interface Draft {
  id: string;
  text: string;
  rationale: string;
}

export interface GenerateRequest {
  incoming_message: string;
  platform: Platform;
  tone: Tone;
  goal: Goal;
  custom_goal?: string;
  thread_context?: string;
}

export interface GenerateResponse {
  reply_id: string;
  drafts: Draft[];
}

export interface Reply {
  id: string;
  user_id: string;
  platform: Platform;
  tone: Tone;
  goal: Goal;
  incoming_message: string;
  thread_context: string | null;
  drafts: Draft[];
  selected_draft_id: string | null;
  edited_text: string | null;
  feedback: -1 | 0 | 1 | null;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
}

export interface VoiceProfile {
  user_id: string;
  avg_sentence_length: number | null;
  formality_score: number | null;
  emoji_frequency: number | null;
  preferred_greeting: string | null;
  preferred_signoff: string | null;
  common_phrases: string[] | null;
  vocabulary_level: "simple" | "standard" | "advanced" | null;
  contraction_usage: number | null;
  paragraph_style: string | null;
  features: Record<string, unknown>;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  default_tone: Tone;
  default_goal: Goal;
  per_platform_defaults: Partial<Record<Platform, { tone?: Tone; goal?: Goal }>>;
  language: string;
  insert_mode: "replace" | "append";
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "team";
  monthly_quota: number;
  monthly_used: number;
  quota_reset_at: string;
  created_at: string;
}

export interface MeResponse {
  profile: Profile;
  settings: UserSettings;
  voice: VoiceProfile;
}

export type ExtensionMessage =
  | { type: "GET_SESSION" }
  | {
      type: "GENERATE_REPLY";
      payload: GenerateRequest;
    }
  | {
      type: "INSERT_FEEDBACK";
      payload: { reply_id: string; draft_id: string; edited_text?: string };
    }
  | {
      type: "RATE_DRAFT";
      payload: { reply_id: string; feedback: -1 | 1 };
    }
  | { type: "SIGN_IN" }
  | { type: "SIGN_OUT" };
