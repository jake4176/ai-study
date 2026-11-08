import type { Cycle, Subscription } from "./types.ts";

export interface CivilDate {
  y: number;
  m: number;
  d: number;
}

export interface SeoulToday extends CivilDate {
  weekday: number;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function seoulToday(now = new Date()): SeoulToday {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[read("weekday")];
  return {
    y: Number(read("year")),
    m: Number(read("month")),
    d: Number(read("day")),
    weekday: weekday ?? 0,
  };
}

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatCivil(date: CivilDate): string {
  return `${date.y}-${pad(date.m)}-${pad(date.d)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

function toUtc(date: CivilDate): number {
  return Date.UTC(date.y, date.m - 1, date.d);
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const next = new Date(toUtc(date) + days * 86_400_000);
  return { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
}

function addMonths(year: number, month: number, delta: number): { y: number; m: number } {
  const index = year * 12 + (month - 1) + delta;
  return { y: Math.floor(index / 12), m: (index % 12) + 1 };
}

export function diffDays(from: CivilDate, to: CivilDate): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function countWeekday(year: number, month: number, weekday: number): number {
  const total = daysInMonth(year, month);
  let count = 0;
  for (let day = 1; day <= total; day += 1) {
    if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() === weekday) count += 1;
  }
  return count;
}

export function nextPayment(sub: Pick<Subscription, "cycle" | "billingDay" | "billingMonth">, today: SeoulToday): CivilDate {
  switch (sub.cycle) {
    case "weekly": {
      const delta = (sub.billingDay - today.weekday + 7) % 7;
      return addDays(today, delta);
    }
    case "monthly": {
      const day = clampDay(today.y, today.m, sub.billingDay);
      if (day >= today.d) return { y: today.y, m: today.m, d: day };
      const next = addMonths(today.y, today.m, 1);
      return { y: next.y, m: next.m, d: clampDay(next.y, next.m, sub.billingDay) };
    }
    case "yearly": {
      const month = sub.billingMonth ?? 1;
      const dayThisYear = clampDay(today.y, month, sub.billingDay);
      if (month > today.m || (month === today.m && dayThisYear >= today.d)) {
        return { y: today.y, m: month, d: dayThisYear };
      }
      return { y: today.y + 1, m: month, d: clampDay(today.y + 1, month, sub.billingDay) };
    }
    default: {
      const neverCycle: never = sub.cycle;
      return neverCycle;
    }
  }
}

export function monthlyEquivalentMinor(sub: Pick<Subscription, "cycle" | "amountMinor">): number {
  switch (sub.cycle) {
    case "weekly":
      return Math.round((sub.amountMinor * 52) / 12);
    case "monthly":
      return sub.amountMinor;
    case "yearly":
      return Math.round(sub.amountMinor / 12);
    default: {
      const neverCycle: never = sub.cycle;
      return neverCycle;
    }
  }
}

export function thisMonthChargeMinor(
  sub: Pick<Subscription, "cycle" | "amountMinor" | "billingDay" | "billingMonth">,
  today: CivilDate,
): number {
  switch (sub.cycle) {
    case "weekly":
      return sub.amountMinor * countWeekday(today.y, today.m, sub.billingDay);
    case "monthly":
      return sub.amountMinor;
    case "yearly":
      return sub.billingMonth === today.m ? sub.amountMinor : 0;
    default: {
      const neverCycle: never = sub.cycle;
      return neverCycle;
    }
  }
}

export function ddayLabel(dday: number): string {
  if (dday === 0) return "오늘";
  if (dday === 1) return "내일";
  return `D-${dday}`;
}

export function scheduleLabel(sub: Pick<Subscription, "cycle" | "billingDay" | "billingMonth">): string {
  switch (sub.cycle) {
    case "weekly":
      return `매주 ${WEEKDAYS[sub.billingDay] ?? "?"}요일`;
    case "monthly":
      return `매월 ${sub.billingDay}일`;
    case "yearly":
      return `매년 ${sub.billingMonth ?? "?"}월 ${sub.billingDay}일`;
    default: {
      const neverCycle: never = sub.cycle;
      return neverCycle;
    }
  }
}

export function cycleLabel(cycle: Cycle): string {
  switch (cycle) {
    case "weekly":
      return "매주";
    case "monthly":
      return "매월";
    case "yearly":
      return "매년";
    default: {
      const neverCycle: never = cycle;
      return neverCycle;
    }
  }
}
