import type { NotifyKind } from "./types.ts";

export function notificationKind(dday: number): NotifyKind | null {
  if (dday === 0) return "d0";
  if (dday === 1) return "d1";
  return null;
}

export function notificationCopy(kind: NotifyKind, name: string, amountLabel: string): { title: string; body: string } {
  switch (kind) {
    case "d0":
      return { title: "오늘 결제", body: `${name} ${amountLabel}` };
    case "d1":
      return { title: "내일 결제", body: `${name} ${amountLabel}` };
    default: {
      const neverKind: never = kind;
      return neverKind;
    }
  }
}
