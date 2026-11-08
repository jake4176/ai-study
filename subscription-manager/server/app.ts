import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import type { DatabaseSync } from "node:sqlite";
import type { SubscriptionDraft } from "../shared/types.ts";
import { CURRENCIES, CYCLES } from "../shared/types.ts";
import { validateSubscription } from "../shared/validate.ts";
import { asRows, type SubscriptionRow, type UserRow } from "./db.ts";
import { checkDueNotifications, type PushMessage, type PushTarget } from "./notify.ts";
import { DUMMY_PASSWORD_HASH, hashPassword, validateCredentials, verifyPassword } from "./passwords.ts";
import { buildSummary } from "./summary.ts";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SUBSCRIPTIONS = 200;

export interface AppOptions {
  db: DatabaseSync;
  now?: () => Date;
  vapidPublicKey: string;
  sendPush: (target: PushTarget, message: PushMessage) => Promise<void>;
}

interface SessionUser {
  id: number;
  email: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

export function createApp(options: AppOptions) {
  const { db } = options;
  const now = () => options.now?.() ?? new Date();
  const attempts = new Map<string, { count: number; reset: number }>();

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use((req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      next();
      return;
    }
    if (!originAllowed(req.header("origin"), req.header("host"))) {
      res.status(403).json({ error: "요청을 거부했습니다." });
      return;
    }
    next();
  });

  function allowAttempt(ip: string): boolean {
    const current = Date.now();
    const row = attempts.get(ip);
    if (!row || row.reset < current) {
      attempts.set(ip, { count: 1, reset: current + 15 * 60 * 1000 });
      return true;
    }
    row.count += 1;
    return row.count <= 20;
  }

  function clientIp(req: Request): string {
    return req.socket.remoteAddress ?? "unknown";
  }

  function setSessionCookie(res: Response, req: Request, sid: string) {
    const secure = req.secure || req.header("x-forwarded-proto") === "https";
    const parts = [`sid=${encodeURIComponent(sid)}`, "HttpOnly", "SameSite=Lax", "Path=/", "Max-Age=2592000"];
    if (secure) parts.push("Secure");
    res.setHeader("Set-Cookie", parts.join("; "));
  }

  function clearSessionCookie(res: Response) {
    res.setHeader("Set-Cookie", "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  }

  function createSession(userId: number): string {
    const sid = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_MS).toISOString();
    db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)").run(sid, userId, expiresAt);
    return sid;
  }

  function currentUser(req: Request): SessionUser | null {
    const sid = readCookie(req.header("cookie"), "sid");
    if (!sid) return null;
    const row = db
      .prepare(
        `SELECT sessions.expires_at AS expires_at, users.id AS id, users.email AS email
         FROM sessions JOIN users ON users.id = sessions.user_id
         WHERE sessions.id = ?`,
      )
      .get(sid) as { expires_at: string; id: number; email: string } | undefined;
    if (!row) return null;
    if (row.expires_at < new Date().toISOString()) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
      return null;
    }
    return { id: row.id, email: row.email };
  }

  function requireUser(req: Request, res: Response): SessionUser | null {
    const user = currentUser(req);
    if (!user) {
      res.status(401).json({ error: "로그인해 주세요." });
      return null;
    }
    return user;
  }

  function summaryFor(userId: number) {
    const rows = db
      .prepare(
        "SELECT id, user_id, name, amount_minor, currency, cycle, billing_day, billing_month FROM subscriptions WHERE user_id = ? ORDER BY id",
      )
      .all(userId);
    return buildSummary(asRows<SubscriptionRow>(rows), now());
  }

  function readDraft(body: unknown): SubscriptionDraft | null {
    if (!isRecord(body)) return null;
    if (typeof body.name !== "string" || typeof body.amount !== "string") return null;
    if (typeof body.billingDay !== "number") return null;
    const currency = CURRENCIES.find((item) => item === body.currency);
    const cycle = CYCLES.find((item) => item === body.cycle);
    if (!currency || !cycle) return null;
    const billingMonth = body.billingMonth === null || body.billingMonth === undefined ? null : body.billingMonth;
    if (billingMonth !== null && typeof billingMonth !== "number") return null;
    return {
      name: body.name,
      amount: body.amount,
      currency,
      cycle,
      billingDay: body.billingDay,
      billingMonth,
    };
  }

  async function notifyUser(userId: number) {
    return checkDueNotifications({ db, userId, now: now(), send: options.sendPush });
  }

  app.post(
    "/api/auth/signup",
    asyncRoute(async (req, res) => {
      if (!allowAttempt(clientIp(req))) {
        res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
        return;
      }
      const credentials = validateCredentials(isRecord(req.body) ? req.body.email : undefined, isRecord(req.body) ? req.body.password : undefined);
      if (!credentials.ok) {
        res.status(400).json({ error: credentials.error });
        return;
      }
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(credentials.email) as { id: number } | undefined;
      if (existing) {
        res.status(409).json({ error: "이미 가입한 이메일입니다." });
        return;
      }
      const created = db
        .prepare("INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)")
        .run(credentials.email, hashPassword(credentials.password), new Date().toISOString());
      const user = { id: Number(created.lastInsertRowid), email: credentials.email };
      setSessionCookie(res, req, createSession(user.id));
      res.status(201).json({ user });
    }),
  );

  app.post(
    "/api/auth/login",
    asyncRoute(async (req, res) => {
      if (!allowAttempt(clientIp(req))) {
        res.status(429).json({ error: "잠시 후 다시 시도해 주세요." });
        return;
      }
      const credentials = validateCredentials(isRecord(req.body) ? req.body.email : undefined, isRecord(req.body) ? req.body.password : undefined);
      if (!credentials.ok) {
        res.status(400).json({ error: credentials.error });
        return;
      }
      const row = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(credentials.email) as UserRow | undefined;
      const hash = row?.password_hash ?? DUMMY_PASSWORD_HASH;
      const matches = verifyPassword(credentials.password, hash);
      if (!row || !matches) {
        res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
        return;
      }
      attempts.delete(clientIp(req));
      setSessionCookie(res, req, createSession(row.id));
      res.json({ user: { id: row.id, email: row.email } });
    }),
  );

  app.post(
    "/api/auth/logout",
    asyncRoute(async (req, res) => {
      const sid = readCookie(req.header("cookie"), "sid");
      if (sid) db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
      clearSessionCookie(res);
      res.status(204).end();
    }),
  );

  app.get(
    "/api/me",
    asyncRoute(async (req, res) => {
      const user = currentUser(req);
      if (!user) {
        res.status(401).json({ error: "로그인해 주세요." });
        return;
      }
      res.json({ user });
    }),
  );

  app.get(
    "/api/summary",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      res.json({ summary: summaryFor(user.id) });
    }),
  );

  app.post(
    "/api/subscriptions",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const count = db.prepare("SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ?").get(user.id) as { count: number };
      if (count.count >= MAX_SUBSCRIPTIONS) {
        res.status(400).json({ error: "구독은 200개까지 기록할 수 있습니다." });
        return;
      }
      const draft = readDraft(req.body);
      if (!draft) {
        res.status(400).json({ error: "구독 이름, 금액, 통화, 결제 주기, 결제일을 확인해 주세요." });
        return;
      }
      const parsed = validateSubscription(draft);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const value = parsed.value;
      db.prepare(
        `INSERT INTO subscriptions (user_id, name, amount_minor, currency, cycle, billing_day, billing_month, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(user.id, value.name, value.amountMinor, value.currency, value.cycle, value.billingDay, value.billingMonth, new Date().toISOString());
      await notifyUser(user.id);
      res.status(201).json({ summary: summaryFor(user.id) });
    }),
  );

  app.patch(
    "/api/subscriptions/:id",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const id = routeId(req.params.id);
      if (id === null) {
        res.status(404).json({ error: "구독을 찾을 수 없습니다." });
        return;
      }
      const owned = db.prepare("SELECT id FROM subscriptions WHERE id = ? AND user_id = ?").get(id, user.id) as { id: number } | undefined;
      if (!owned) {
        res.status(404).json({ error: "구독을 찾을 수 없습니다." });
        return;
      }
      const draft = readDraft(req.body);
      if (!draft) {
        res.status(400).json({ error: "구독 이름, 금액, 통화, 결제 주기, 결제일을 확인해 주세요." });
        return;
      }
      const parsed = validateSubscription(draft);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      const value = parsed.value;
      db.prepare(
        `UPDATE subscriptions
         SET name = ?, amount_minor = ?, currency = ?, cycle = ?, billing_day = ?, billing_month = ?
         WHERE id = ? AND user_id = ?`,
      ).run(value.name, value.amountMinor, value.currency, value.cycle, value.billingDay, value.billingMonth, id, user.id);
      db.prepare("DELETE FROM notification_log WHERE subscription_id = ?").run(id);
      await notifyUser(user.id);
      res.json({ summary: summaryFor(user.id) });
    }),
  );

  app.delete(
    "/api/subscriptions/:id",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const id = routeId(req.params.id);
      if (id === null) {
        res.status(404).json({ error: "구독을 찾을 수 없습니다." });
        return;
      }
      const result = db.prepare("DELETE FROM subscriptions WHERE id = ? AND user_id = ?").run(id, user.id);
      if (result.changes === 0) {
        res.status(404).json({ error: "구독을 찾을 수 없습니다." });
        return;
      }
      res.json({ summary: summaryFor(user.id) });
    }),
  );

  app.get(
    "/api/push/public-key",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      res.json({ publicKey: options.vapidPublicKey });
    }),
  );

  app.post(
    "/api/push/subscribe",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      if (!isRecord(req.body)) {
        res.status(400).json({ error: "알림 구독 정보가 올바르지 않습니다." });
        return;
      }
      const endpoint = req.body.endpoint;
      const keys = isRecord(req.body.keys) ? req.body.keys : null;
      if (typeof endpoint !== "string" || !isSafePushEndpoint(endpoint)) {
        res.status(400).json({ error: "알림 구독 정보가 올바르지 않습니다." });
        return;
      }
      const p256dh = keys && typeof keys.p256dh === "string" ? keys.p256dh : "";
      const auth = keys && typeof keys.auth === "string" ? keys.auth : "";
      if (p256dh.length < 8 || p256dh.length > 256 || auth.length < 8 || auth.length > 256) {
        res.status(400).json({ error: "알림 구독 정보가 올바르지 않습니다." });
        return;
      }
      const existing = db.prepare("SELECT id, user_id FROM push_subscriptions WHERE endpoint = ?").get(endpoint) as
        | { id: number; user_id: number }
        | undefined;
      if (existing) {
        db.prepare("UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ? WHERE id = ?").run(user.id, p256dh, auth, existing.id);
      } else {
        db.prepare("INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?)").run(
          user.id,
          endpoint,
          p256dh,
          auth,
          new Date().toISOString(),
        );
      }
      res.status(204).end();
    }),
  );

  app.delete(
    "/api/push/subscribe",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const endpoint = isRecord(req.body) && typeof req.body.endpoint === "string" ? req.body.endpoint : null;
      if (endpoint) {
        db.prepare("DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?").run(user.id, endpoint);
      } else {
        db.prepare("DELETE FROM push_subscriptions WHERE user_id = ?").run(user.id);
      }
      res.status(204).end();
    }),
  );

  app.post(
    "/api/notifications/check",
    asyncRoute(async (req, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const sent = await notifyUser(user.id);
      res.json({ sent });
    }),
  );

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "없는 주소입니다." });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: "요청 형식이 올바르지 않습니다." });
      return;
    }
    res.status(500).json({ error: "처리하지 못했습니다." });
  });

  return app;
}

const DEV_ORIGINS = new Set(["http://127.0.0.1:5173", "http://localhost:5173"]);

function originAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (host && url.host === host) return true;
  return process.env.NODE_ENV !== "production" && DEV_ORIGINS.has(url.origin);
}

function isSafePushEndpoint(endpoint: string): boolean {
  if (endpoint.length > 2000) return false;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if ([a, b, Number(ipv4[3]), Number(ipv4[4])].some((part) => part > 255)) return false;
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    return true;
  }
  if (host.includes(":")) {
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return false;
    if (host.startsWith("::ffff:")) return isSafePushEndpoint(`https://${host.slice("::ffff:".length)}/`);
    return true;
  }
  return true;
}

function routeId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
