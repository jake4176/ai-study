import { describe, expect, it } from "vitest";
import { diffDays, monthlyEquivalentMinor, nextPayment, seoulToday, thisMonthChargeMinor, countWeekday } from "../shared/billing.ts";
import { formatMoney, parseAmountToMinor } from "../shared/money.ts";
import { notificationCopy, notificationKind } from "../shared/notify.ts";
import { validateSubscription } from "../shared/validate.ts";

describe("billing", () => {
  it("reads Seoul civil date", () => {
    const today = seoulToday(new Date("2026-11-09T00:00:00Z"));
    expect(today).toMatchObject({ y: 2026, m: 11, d: 9, weekday: 1 });
  });

  it("keeps a monthly payment on the billing day and rolls past days to next month", () => {
    const today = { y: 2026, m: 11, d: 9, weekday: 1 };
    const dueToday = nextPayment({ cycle: "monthly", billingDay: 9, billingMonth: null }, today);
    expect(diffDays(today, dueToday)).toBe(0);
    const passed = nextPayment({ cycle: "monthly", billingDay: 8, billingMonth: null }, today);
    expect(passed).toEqual({ y: 2026, m: 12, d: 8 });
  });

  it("clamps day 31 to the last day of February, including leap years", () => {
    const feb = nextPayment({ cycle: "monthly", billingDay: 31, billingMonth: null }, { y: 2026, m: 2, d: 9, weekday: 1 });
    expect(feb).toEqual({ y: 2026, m: 2, d: 28 });
    const leap = nextPayment({ cycle: "monthly", billingDay: 31, billingMonth: null }, { y: 2024, m: 2, d: 10, weekday: 6 });
    expect(leap).toEqual({ y: 2024, m: 2, d: 29 });
  });

  it("schedules the next weekday, including today", () => {
    const today = { y: 2026, m: 11, d: 9, weekday: 1 };
    expect(nextPayment({ cycle: "weekly", billingDay: 1, billingMonth: null }, today)).toEqual({ y: 2026, m: 11, d: 9 });
    expect(nextPayment({ cycle: "weekly", billingDay: 0, billingMonth: null }, today)).toEqual({ y: 2026, m: 11, d: 15 });
  });

  it("rolls a yearly date into next year after it has passed", () => {
    const today = { y: 2026, m: 11, d: 9, weekday: 1 };
    expect(nextPayment({ cycle: "yearly", billingDay: 15, billingMonth: 1 }, today)).toEqual({ y: 2027, m: 1, d: 15 });
    expect(nextPayment({ cycle: "yearly", billingDay: 9, billingMonth: 11 }, today)).toEqual({ y: 2026, m: 11, d: 9 });
  });

  it("sums this month and the monthly equivalent without converting currency", () => {
    const today = { y: 2026, m: 11, d: 9 };
    expect(countWeekday(2026, 11, 1)).toBe(5);
    const weekly = { cycle: "weekly" as const, amountMinor: 1000, billingDay: 1, billingMonth: null };
    expect(thisMonthChargeMinor(weekly, today)).toBe(5000);
    expect(monthlyEquivalentMinor(weekly)).toBe(4333);
    expect(monthlyEquivalentMinor({ cycle: "yearly", amountMinor: 12000 })).toBe(1000);
    expect(thisMonthChargeMinor({ cycle: "yearly", amountMinor: 12000, billingDay: 9, billingMonth: 3 }, today)).toBe(0);
  });
});

describe("money and notifications", () => {
  it("parses whole won and cent amounts", () => {
    expect(parseAmountToMinor("13500", "KRW")).toBe(13500);
    expect(parseAmountToMinor("13.500", "KRW")).toBeNull();
    expect(parseAmountToMinor("9.9", "USD")).toBe(990);
    expect(parseAmountToMinor("0", "KRW")).toBeNull();
    expect(formatMoney(13500, "KRW")).toContain("13,500");
  });

  it("notifies only on the day and the day before", () => {
    expect(notificationKind(0)).toBe("d0");
    expect(notificationKind(1)).toBe("d1");
    expect(notificationKind(2)).toBeNull();
    expect(notificationCopy("d0", "넷플릭스", "₩13,500").title).toBe("오늘 결제");
    expect(notificationCopy("d1", "넷플릭스", "₩13,500").title).toBe("내일 결제");
  });

  it("rejects an unnamed subscription and a yearly plan without a month", () => {
    expect(validateSubscription({ name: "  ", amount: "1000", currency: "KRW", cycle: "monthly", billingDay: 3, billingMonth: null }).ok).toBe(false);
    const yearly = validateSubscription({ name: "클라우드", amount: "120000", currency: "KRW", cycle: "yearly", billingDay: 3, billingMonth: null });
    expect(yearly.ok).toBe(false);
  });
});
