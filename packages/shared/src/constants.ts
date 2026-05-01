export const TONES = [
  "professional",
  "friendly",
  "casual",
  "direct",
  "empathetic",
  "concise",
] as const;

export const GOALS = [
  "follow_up",
  "close_deal",
  "decline_politely",
  "request_meeting",
  "negotiate",
  "build_rapport",
  "answer_question",
  "introduce",
  "custom",
] as const;

export const PLATFORMS = [
  "gmail",
  "outlook",
  "linkedin",
  "slack",
  "whatsapp",
  "x",
] as const;

export const TONE_LABELS: Record<(typeof TONES)[number], string> = {
  professional: "Professional",
  friendly: "Friendly",
  casual: "Casual",
  direct: "Direct",
  empathetic: "Empathetic",
  concise: "Concise",
};

export const GOAL_LABELS: Record<(typeof GOALS)[number], string> = {
  follow_up: "Follow up",
  close_deal: "Close deal",
  decline_politely: "Decline politely",
  request_meeting: "Request meeting",
  negotiate: "Negotiate",
  build_rapport: "Build rapport",
  answer_question: "Answer question",
  introduce: "Introduce",
  custom: "Custom",
};

export const PLATFORM_LABELS: Record<(typeof PLATFORMS)[number], string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  linkedin: "LinkedIn",
  slack: "Slack",
  whatsapp: "WhatsApp",
  x: "X / Twitter",
};

export const DEFAULT_QUOTA = 30;
export const MODEL_ID = "gemini-2.0-flash";
export const MAX_INCOMING_CHARS = 8000;
