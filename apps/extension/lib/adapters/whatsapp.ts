import type { PlatformAdapter } from "./index";

export const whatsappAdapter: PlatformAdapter = {
  platform: "whatsapp",
  matches: (host) => host === "web.whatsapp.com",
  findReplyBox: () => {
    return document.querySelector<HTMLElement>(
      'footer div[contenteditable="true"][role="textbox"]',
    );
  },
  insertText: (text, mode = "replace") => {
    const box = whatsappAdapter.findReplyBox();
    if (!box) return false;
    box.focus();
    if (mode === "replace") {
      const sel = window.getSelection();
      sel?.selectAllChildren(box);
      sel?.deleteFromDocument();
    }
    document.execCommand("insertText", false, text);
    return true;
  },
};
