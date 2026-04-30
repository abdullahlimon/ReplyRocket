import type { PlatformAdapter } from "./index";

export const xAdapter: PlatformAdapter = {
  platform: "x",
  matches: (host) => host.endsWith("x.com") || host.endsWith("twitter.com"),
  findReplyBox: () => {
    return (
      document.querySelector<HTMLElement>(
        'div[role="textbox"][data-testid^="tweetTextarea"]',
      ) ??
      document.querySelector<HTMLElement>(
        'div[contenteditable="true"][role="textbox"]',
      )
    );
  },
  insertText: (text, mode = "replace") => {
    const box = xAdapter.findReplyBox();
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
