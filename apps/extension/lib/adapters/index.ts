import type { Platform } from "@replyrocket/shared";
import { gmailAdapter } from "./gmail";
import { outlookAdapter } from "./outlook";
import { linkedinAdapter } from "./linkedin";
import { slackAdapter } from "./slack";
import { whatsappAdapter } from "./whatsapp";
import { xAdapter } from "./x";

export interface PlatformAdapter {
  platform: Platform;
  matches: (host: string) => boolean;
  /** Find the closest "reply input" element for the given selection / page state. */
  findReplyBox: () => HTMLElement | null;
  /** Insert text into the reply box. Honors mode = replace | append. */
  insertText: (text: string, mode?: "replace" | "append") => boolean;
  /** Optional: pull the prior thread context near the selection. */
  getThreadContext?: () => string | null;
}

const ADAPTERS: PlatformAdapter[] = [
  gmailAdapter,
  outlookAdapter,
  linkedinAdapter,
  slackAdapter,
  whatsappAdapter,
  xAdapter,
];

export function detectPlatform(host: string = location.hostname): PlatformAdapter | null {
  return ADAPTERS.find((a) => a.matches(host)) ?? null;
}
