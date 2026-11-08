import { notificationCopy, notificationKind } from "../../shared/notify.ts";
import { formatMoney } from "../../shared/money.ts";
import type { SubscriptionView } from "../../shared/types.ts";

const claimed = new Set<string>();

export function notifyOpenItems(items: SubscriptionView[], today: string): number {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return 0;
  let shown = 0;
  for (const item of items) {
    const kind = notificationKind(item.dday);
    if (!kind) continue;
    const key = `${today}:${item.id}:${kind}`;
    if (claimed.has(key) || localStorage.getItem(`notify:${key}`)) continue;
    claimed.add(key);
    localStorage.setItem(`notify:${key}`, "1");
    const copy = notificationCopy(kind, item.name, formatMoney(item.amountMinor, item.currency));
    new Notification(copy.title, { body: copy.body, icon: "/icon-192.png" });
    shown += 1;
  }
  return shown;
}
