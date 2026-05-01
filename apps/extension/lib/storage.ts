import { Storage } from "@plasmohq/storage";

export const storage = new Storage({ area: "local" });

export const KEYS = {
  TOKEN: "rr_token",
  LAST_TONE: "rr_last_tone",
  LAST_GOAL: "rr_last_goal",
  USER_EMAIL: "rr_user_email",
} as const;
