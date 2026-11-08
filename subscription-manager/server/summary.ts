import {
  diffDays,
  formatCivil,
  monthlyEquivalentMinor,
  nextPayment,
  seoulToday,
  thisMonthChargeMinor,
  type SeoulToday,
} from "../shared/billing.ts";
import type { Currency, Cycle, SubscriptionView, Summary } from "../shared/types.ts";
import { CURRENCIES, CYCLES } from "../shared/types.ts";
import type { SubscriptionRow } from "./db.ts";

function isCurrency(value: string): value is Currency {
  return CURRENCIES.some((currency) => currency === value);
}

function isCycle(value: string): value is Cycle {
  return CYCLES.some((cycle) => cycle === value);
}

export function toView(row: SubscriptionRow, today: SeoulToday): SubscriptionView | null {
  if (!isCurrency(row.currency) || !isCycle(row.cycle)) return null;
  const subscription = {
    id: row.id,
    name: row.name,
    amountMinor: row.amount_minor,
    currency: row.currency,
    cycle: row.cycle,
    billingDay: row.billing_day,
    billingMonth: row.billing_month,
  };
  const next = nextPayment(subscription, today);
  return {
    ...subscription,
    nextPayment: formatCivil(next),
    dday: diffDays(today, next),
    monthlyEquivalentMinor: monthlyEquivalentMinor(subscription),
    thisMonthChargeMinor: thisMonthChargeMinor(subscription, today),
  };
}

export function buildSummary(rows: SubscriptionRow[], now: Date): Summary {
  const today = seoulToday(now);
  const items = rows.flatMap((row) => {
    const view = toView(row, today);
    return view ? [view] : [];
  });
  items.sort((a, b) => a.dday - b.dday || a.name.localeCompare(b.name, "ko"));
  const currencies = CURRENCIES.filter((currency) => items.some((item) => item.currency === currency));
  return {
    month: `${today.y}-${String(today.m).padStart(2, "0")}`,
    today: formatCivil(today),
    count: items.length,
    items,
    totals: currencies.map((currency) => ({
      currency,
      thisMonthMinor: items.filter((item) => item.currency === currency).reduce((sum, item) => sum + item.thisMonthChargeMinor, 0),
      monthlyEquivalentMinor: items
        .filter((item) => item.currency === currency)
        .reduce((sum, item) => sum + item.monthlyEquivalentMinor, 0),
    })),
  };
}
