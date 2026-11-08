import { notificationCopy, notificationKind } from "../shared/notify.ts";
import { formatMoney } from "../shared/money.ts";
import type { DatabaseSync } from "node:sqlite";
import { asRows, type PushRow, type SubscriptionRow } from "./db.ts";
import { buildSummary } from "./summary.ts";

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
}

interface CheckOptions {
  db: DatabaseSync;
  userId?: number;
  now: Date;
  send: (target: PushTarget, message: PushMessage) => Promise<void>;
}

function isGone(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return false;
  const statusCode = error.statusCode;
  return statusCode === 404 || statusCode === 410;
}

export async function checkDueNotifications(options: CheckOptions): Promise<number> {
  const { db, now, send } = options;
  const rows = (
    options.userId === undefined
      ? db.prepare("SELECT id, user_id, name, amount_minor, currency, cycle, billing_day, billing_month FROM subscriptions").all()
      : db
          .prepare(
            "SELECT id, user_id, name, amount_minor, currency, cycle, billing_day, billing_month FROM subscriptions WHERE user_id = ?",
          )
          .all(options.userId)
  );
  const subscriptionRows = asRows<SubscriptionRow>(rows);

  const byUser = new Map<number, SubscriptionRow[]>();
  for (const row of subscriptionRows) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  let sent = 0;
  for (const [userId, userRows] of byUser) {
    const summary = buildSummary(userRows, now);
    const devices = asRows<PushRow>(
      db.prepare("SELECT id, user_id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?").all(userId),
    );
    if (devices.length === 0) continue;

    for (const item of summary.items) {
      const kind = notificationKind(item.dday);
      if (!kind) continue;
      const claimed = db
        .prepare("INSERT OR IGNORE INTO notification_log (user_id, subscription_id, kind, sent_on) VALUES (?, ?, ?, ?)")
        .run(userId, item.id, kind, summary.today);
      if (claimed.changes === 0) continue;

      const message = {
        ...notificationCopy(kind, item.name, formatMoney(item.amountMinor, item.currency)),
        url: "/?tab=alerts",
      };
      let delivered = false;
      for (const device of devices) {
        try {
          await send({ endpoint: device.endpoint, p256dh: device.p256dh, auth: device.auth }, message);
          delivered = true;
        } catch (error) {
          if (isGone(error)) {
            db.prepare("DELETE FROM push_subscriptions WHERE id = ?").run(device.id);
          }
        }
      }
      if (!delivered) {
        db.prepare("DELETE FROM notification_log WHERE user_id = ? AND subscription_id = ? AND kind = ? AND sent_on = ?").run(
          userId,
          item.id,
          kind,
          summary.today,
        );
      } else {
        sent += 1;
      }
    }
  }
  return sent;
}
