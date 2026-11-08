export const CYCLES = ["weekly", "monthly", "yearly"] as const;
export type Cycle = (typeof CYCLES)[number];

export const CURRENCIES = ["KRW", "USD", "EUR", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface SubscriptionDraft {
  name: string;
  amount: string;
  currency: Currency;
  cycle: Cycle;
  billingDay: number;
  billingMonth: number | null;
}

export interface Subscription {
  id: number;
  name: string;
  amountMinor: number;
  currency: Currency;
  cycle: Cycle;
  billingDay: number;
  billingMonth: number | null;
}

export interface SubscriptionView extends Subscription {
  nextPayment: string;
  dday: number;
  monthlyEquivalentMinor: number;
  thisMonthChargeMinor: number;
}

export interface CurrencyTotal {
  currency: Currency;
  thisMonthMinor: number;
  monthlyEquivalentMinor: number;
}

export interface Summary {
  month: string;
  today: string;
  count: number;
  items: SubscriptionView[];
  totals: CurrencyTotal[];
}

export interface User {
  id: number;
  email: string;
}

export type NotifyKind = "d0" | "d1";
