import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import webpush from "web-push";
import { createApp } from "./app.ts";
import { defaultDbPath, openDatabase } from "./db.ts";
import { checkDueNotifications, type PushMessage, type PushTarget } from "./notify.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const db = openDatabase(defaultDbPath());
const vapid = loadVapid(path.join(root, "data", "vapid.json"));
webpush.setVapidDetails("mailto:subscription-manager@localhost", vapid.publicKey, vapid.privateKey);

async function sendPush(target: PushTarget, message: PushMessage) {
  await webpush.sendNotification(
    {
      endpoint: target.endpoint,
      keys: { p256dh: target.p256dh, auth: target.auth },
    },
    JSON.stringify(message),
  );
}

const app = createApp({
  db,
  vapidPublicKey: vapid.publicKey,
  sendPush,
});

if (process.env.NODE_ENV === "production") {
  const dist = path.join(root, "dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(dist, "index.html"));
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, "127.0.0.1", () => {
  console.log(`구독 매니저 API http://127.0.0.1:${port}`);
});

const interval = setInterval(() => {
  void checkDueNotifications({ db, now: new Date(), send: sendPush }).catch(() => {
    console.error("결제일 알림 확인에 실패했습니다.");
  });
}, 15 * 60 * 1000);
interval.unref();

function loadVapid(filePath: string): { publicKey: string; privateKey: string } {
  if (existsSync(filePath)) {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { publicKey?: string; privateKey?: string };
    if (parsed.publicKey && parsed.privateKey) return { publicKey: parsed.publicKey, privateKey: parsed.privateKey };
  }
  const keys = webpush.generateVAPIDKeys();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(keys), { mode: 0o600 });
  return keys;
}
