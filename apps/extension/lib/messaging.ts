import type { ExtensionMessage } from "@replyrocket/shared";

export type Reply<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export function sendBg<T = unknown>(msg: ExtensionMessage): Promise<Reply<T>> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response: Reply<T>) => {
      const err = chrome.runtime.lastError;
      if (err) return resolve({ ok: false, error: err.message ?? "unknown" });
      resolve(response);
    });
  });
}
