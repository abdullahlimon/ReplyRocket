import type {
  GenerateRequest,
  GenerateResponse,
  MeResponse,
} from "@replyrocket/shared";

export const API_URL =
  process.env.PLASMO_PUBLIC_API_URL ||
  "https://reply-rocket-web.vercel.app";

interface ApiOptions {
  token: string;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & ApiOptions,
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body}`);
  }
}

export function generate(token: string, payload: GenerateRequest) {
  return apiFetch<GenerateResponse & { quota: { used: number; quota: number } }>(
    "/api/generate",
    {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function selectDraft(
  token: string,
  replyId: string,
  body: { draft_id: string; edited_text?: string },
) {
  return apiFetch<{ ok: true }>(`/api/replies/${replyId}/select`, {
    token,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function rateDraft(
  token: string,
  replyId: string,
  feedback: -1 | 1,
) {
  return apiFetch<{ ok: true }>(`/api/replies/${replyId}/feedback`, {
    token,
    method: "POST",
    body: JSON.stringify({ feedback }),
  });
}

export function me(token: string) {
  return apiFetch<MeResponse>("/api/me", { token, method: "GET" });
}
