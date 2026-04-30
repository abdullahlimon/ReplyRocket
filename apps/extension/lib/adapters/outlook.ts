import type { PlatformAdapter } from "./index";

export const outlookAdapter: PlatformAdapter = {
  platform: "outlook",
  matches: (host) =>
    host.endsWith("outlook.live.com") ||
    host.endsWith("outlook.office.com") ||
    host.endsWith("outlook.office365.com"),
  findReplyBox: () => {
    return (
      document.querySelector<HTMLElement>(
        'div[contenteditable="true"][aria-label*="Message body"]',
      ) ??
      document.querySelector<HTMLElement>(
        'div[contenteditable="true"][role="textbox"]',
      )
    );
  },
  insertText: (text, mode = "replace") => {
    const box = outlookAdapter.findReplyBox();
    if (!box) return false;
    box.focus();
    if (mode === "replace") box.innerText = "";
    document.execCommand("insertText", false, text);
    return true;
  },
};
