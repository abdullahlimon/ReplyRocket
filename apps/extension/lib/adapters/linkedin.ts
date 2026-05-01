import type { PlatformAdapter } from "./index";

export const linkedinAdapter: PlatformAdapter = {
  platform: "linkedin",
  matches: (host) => host.endsWith("linkedin.com"),
  findReplyBox: () => {
    return (
      document.querySelector<HTMLElement>(
        ".msg-form__contenteditable[contenteditable='true']",
      ) ??
      document.querySelector<HTMLElement>(
        "div.ql-editor[contenteditable='true']",
      )
    );
  },
  insertText: (text, mode = "replace") => {
    const box = linkedinAdapter.findReplyBox();
    if (!box) return false;
    box.focus();
    if (mode === "replace") box.innerHTML = "";
    document.execCommand("insertText", false, text);
    box.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  },
};
