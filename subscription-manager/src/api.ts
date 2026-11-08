import type { SubscriptionDraft, Summary, User } from "../shared/types.ts";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, credentials: "same-origin" });
  } catch {
    throw new ApiError(0, "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? "요청에 실패했습니다.");
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User }>("/api/me"),
  signup: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  summary: () => request<{ summary: Summary }>("/api/summary"),
  createSubscription: (draft: SubscriptionDraft) =>
    request<{ summary: Summary }>("/api/subscriptions", { method: "POST", body: JSON.stringify(draft) }),
  updateSubscription: (id: number, draft: SubscriptionDraft) =>
    request<{ summary: Summary }>(`/api/subscriptions/${id}`, { method: "PATCH", body: JSON.stringify(draft) }),
  deleteSubscription: (id: number) => request<{ summary: Summary }>(`/api/subscriptions/${id}`, { method: "DELETE" }),
  pushPublicKey: () => request<{ publicKey: string }>("/api/push/public-key"),
  savePush: (subscription: PushSubscriptionJSON) =>
    request<void>("/api/push/subscribe", { method: "POST", body: JSON.stringify(subscription) }),
  deletePush: (endpoint: string | null) =>
    request<void>("/api/push/subscribe", {
      method: "DELETE",
      body: JSON.stringify(endpoint ? { endpoint } : {}),
    }),
  checkNotifications: () => request<{ sent: number }>("/api/notifications/check", { method: "POST" }),
};
