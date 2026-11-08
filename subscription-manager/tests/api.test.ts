import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../server/app.ts";
import { openDatabase } from "../server/db.ts";
import type { DatabaseSync } from "node:sqlite";
import type { PushMessage, PushTarget } from "../server/notify.ts";
import type { Summary } from "../shared/types.ts";

interface SentNote {
  endpoint: string;
  message: PushMessage;
}

const openServers: Server[] = [];
const openDbs: DatabaseSync[] = [];

afterEach(async () => {
  await Promise.all(
    openServers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
  for (const db of openDbs.splice(0)) db.close();
});

async function start() {
  const sent: SentNote[] = [];
  const db = openDatabase(":memory:");
  openDbs.push(db);
  const app = createApp({
    db,
    now: () => new Date("2026-11-09T00:00:00Z"),
    vapidPublicKey: "B".repeat(80),
    sendPush: async (target: PushTarget, message: PushMessage) => {
      sent.push({ endpoint: target.endpoint, message });
    },
  });
  const server = app.listen(0, "127.0.0.1");
  openServers.push(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  return { sent, port };
}

function client(port: number) {
  let cookie = "";
  return async function call(path: string, init?: RequestInit & { origin?: string }) {
    const headers = new Headers(init?.headers);
    if (cookie) headers.set("cookie", cookie);
    if (init?.body) headers.set("content-type", "application/json");
    if (init?.origin) headers.set("origin", init.origin);
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { ...init, headers });
    for (const item of response.headers.getSetCookie()) {
      const [pair] = item.split(";");
      const [key, value = ""] = pair.split("=");
      if (key === "sid") cookie = value ? `sid=${value}` : "";
    }
    const text = await response.text();
    return { status: response.status, body: text ? (JSON.parse(text) as Record<string, unknown>) : null };
  };
}

const netflix = {
  name: "넷플릭스",
  amount: "13500",
  currency: "KRW",
  cycle: "monthly",
  billingDay: 9,
  billingMonth: null,
};

describe("subscription api", () => {
  it("keeps each account on its own subscriptions", async () => {
    const { port } = await start();
    const mina = client(port);
    const june = client(port);
    expect((await mina("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "mina@example.com", password: "password1" }) })).status).toBe(201);
    const created = await mina("/api/subscriptions", { method: "POST", body: JSON.stringify(netflix) });
    expect(created.status).toBe(201);
    const summary = created.body?.summary as Summary;
    expect(summary.count).toBe(1);
    expect(summary.items[0]?.name).toBe("넷플릭스");
    expect(summary.items[0]?.dday).toBe(0);
    expect(summary.totals[0]?.thisMonthMinor).toBe(13500);

    expect((await june("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "june@example.com", password: "password2" }) })).status).toBe(201);
    const other = await june("/api/summary");
    expect((other.body?.summary as Summary).count).toBe(0);
    const id = summary.items[0]?.id;
    expect((await june(`/api/subscriptions/${id}`, { method: "DELETE" })).status).toBe(404);
    expect((await mina("/api/summary")).body?.summary).toMatchObject({ count: 1 });
  });

  it("rejects empty amounts and a foreign origin", async () => {
    const { port } = await start();
    const call = client(port);
    await call("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "mina@example.com", password: "password1" }) });
    const zero = await call("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ ...netflix, amount: "0" }),
    });
    expect(zero.status).toBe(400);
    const localPush = await call("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: "https://127.0.0.1/push", keys: { p256dh: "p256dh-key", auth: "auth-key" } }),
    });
    expect(localPush.status).toBe(400);
    const browserPush = await call("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: "https://fcm.googleapis.com/fcm/send/device",
        keys: { p256dh: "p256dh-key", auth: "auth-key" },
      }),
    });
    expect(browserPush.status).toBe(204);
    const forged = await call("/api/subscriptions", {
      method: "POST",
      origin: "https://evil.example",
      body: JSON.stringify(netflix),
    });
    expect(forged.status).toBe(403);
  });

  it("sends a payment notification once for today and again after the date changes", async () => {
    const { port, sent } = await start();
    const call = client(port);
    await call("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "mina@example.com", password: "password1" }) });
    await call("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: "https://push.example.test/mina",
        keys: { p256dh: "p256dh-key", auth: "auth-key" },
      }),
    });
    await call("/api/subscriptions", { method: "POST", body: JSON.stringify(netflix) });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.message.title).toBe("오늘 결제");
    expect(sent[0]?.message.body).toContain("넷플릭스");
    const again = await call("/api/notifications/check", { method: "POST" });
    expect(again.body).toMatchObject({ sent: 0 });
    expect(sent).toHaveLength(1);

    const tomorrow = await call("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ ...netflix, name: "음악", billingDay: 10 }),
    });
    expect(tomorrow.status).toBe(201);
    expect(sent.map((note) => note.message.title)).toContain("내일 결제");

    const later = await call("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ ...netflix, name: "클라우드", billingDay: 20 }),
    });
    expect(later.status).toBe(201);
    expect(sent.some((note) => note.message.body.includes("클라우드"))).toBe(false);
  });

  it("adds a second currency without converting it", async () => {
    const { port } = await start();
    const call = client(port);
    const missing = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: "missing@example.com", password: "password1" }) });
    expect(missing.status).toBe(401);
    await call("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "mina@example.com", password: "password1" }) });
    await call("/api/subscriptions", { method: "POST", body: JSON.stringify(netflix) });
    const mixed = await call("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ name: "Music", amount: "9.99", currency: "USD", cycle: "monthly", billingDay: 3, billingMonth: null }),
    });
    const summary = mixed.body?.summary as Summary;
    expect(summary.totals.map((total) => total.currency)).toEqual(["KRW", "USD"]);
    expect(summary.totals.find((total) => total.currency === "USD")?.thisMonthMinor).toBe(999);
  });
});
