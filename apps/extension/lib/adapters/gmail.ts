import type { PlatformAdapter } from "./index";

export const gmailAdapter: PlatformAdapter = {
  platform: "gmail",
  matches: (host) => host.endsWith("mail.google.com"),
  findReplyBox: () => {
    // Gmail compose bodies are <div contenteditable="true" aria-label="Message Body">
    const candidates = document.querySelectorAll<HTMLElement>(
      'div[contenteditable="true"][aria-label*="Message Body"], ' +
        'div[contenteditable="true"][g_editable="true"]',
    );
    if (candidates.length === 0) return null;
    return candidates[candidates.length - 1] ?? null;
  },
  insertText: (text, mode = "replace") => {
    const box = gmailAdapter.findReplyBox();
    if (!box) return false;
    box.focus();
    if (mode === "replace") box.innerText = "";
    document.execCommand("insertText", false, text);
    return true;
  },
  getThreadContext: () => {
    const messages = Array.from(
      document.querySelectorAll<HTMLElement>(".adn .a3s.aiL"),
    ).slice(-3);
    return messages.map((m) => m.innerText.trim()).join("\n\n---\n\n") || null;
  },
};
