import type { ExtensionMessage } from "@replyrocket/shared";
import { generate, me, rateDraft, selectDraft } from "~lib/api";
import { KEYS, storage } from "~lib/storage";

async function getToken(): Promise<string | null> {
  return (await storage.get(KEYS.TOKEN)) ?? null;
}

chrome.runtime.onMessage.addListener(
  (msg: ExtensionMessage, _sender, sendResponse) => {
    (async () => {
      try {
        switch (msg.type) {
          case "GET_SESSION": {
            const token = await getToken();
            const email = (await storage.get(KEYS.USER_EMAIL)) ?? null;
            sendResponse({ ok: true, data: { signedIn: !!token, email } });
            break;
          }
          case "GENERATE_REPLY": {
            const token = await getToken();
            if (!token) {
              sendResponse({ ok: false, error: "not_signed_in", status: 401 });
              return;
            }
            const data = await generate(token, msg.payload);
            sendResponse({ ok: true, data });
            break;
          }
          case "INSERT_FEEDBACK": {
            const token = await getToken();
            if (!token) {
              sendResponse({ ok: false, error: "not_signed_in" });
              return;
            }
            const data = await selectDraft(token, msg.payload.reply_id, {
              draft_id: msg.payload.draft_id,
              edited_text: msg.payload.edited_text,
            });
            sendResponse({ ok: true, data });
            break;
          }
          case "RATE_DRAFT": {
            const token = await getToken();
            if (!token) {
              sendResponse({ ok: false, error: "not_signed_in" });
              return;
            }
            const data = await rateDraft(token, msg.payload.reply_id, msg.payload.feedback);
            sendResponse({ ok: true, data });
            break;
          }
          case "SIGN_IN": {
            const url = `${process.env.PLASMO_PUBLIC_API_URL}/auth/extension?ext=${chrome.runtime.id}`;
            chrome.tabs.create({ url });
            sendResponse({ ok: true, data: null });
            break;
          }
          case "SIGN_OUT": {
            await storage.remove(KEYS.TOKEN);
            await storage.remove(KEYS.USER_EMAIL);
            sendResponse({ ok: true, data: null });
            break;
          }
        }
      } catch (e) {
        sendResponse({ ok: false, error: (e as Error).message });
      }
    })();
    return true; // keep the response channel open
  },
);

// Cross-origin handshake from the web app's /auth/extension page.
chrome.runtime.onMessageExternal.addListener(async (msg, _sender, sendResponse) => {
  if (msg?.type === "REPLYROCKET_AUTH" && typeof msg.token === "string") {
    await storage.set(KEYS.TOKEN, msg.token);
    try {
      const meRes = await me(msg.token);
      if (meRes.profile?.email) {
        await storage.set(KEYS.USER_EMAIL, meRes.profile.email);
      }
    } catch {
      // ignore — token still saved
    }
    sendResponse({ ok: true });
  }
});
