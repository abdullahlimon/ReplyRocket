import type { PlatformAdapter } from "./index";

export const slackAdapter: PlatformAdapter = {
  platform: "slack",
  matches: (host) => host.endsWith("slack.com"),
  findReplyBox: () => {
    return document.querySelector<HTMLElement>(
      'div.ql-editor[contenteditable="true"]',
    );
  },
  insertText: (text, mode = "replace") => {
    const box = slackAdapter.findReplyBox();
    if (!box) return false;
    box.focus();
    if (mode === "replace") box.innerHTML = "";
    document.execCommand("insertText", false, text);
    return true;
  },
};
