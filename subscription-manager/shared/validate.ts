import { parseAmountToMinor } from "./money.ts";
import { CURRENCIES, CYCLES, type Currency, type Cycle, type SubscriptionDraft } from "./types.ts";

export interface ValidSubscription {
  name: string;
  amountMinor: number;
  currency: Currency;
  cycle: Cycle;
  billingDay: number;
  billingMonth: number | null;
}

export type Validation = { ok: true; value: ValidSubscription } | { ok: false; error: string };

function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && CURRENCIES.some((currency) => currency === value);
}

function isCycle(value: unknown): value is Cycle {
  return typeof value === "string" && CYCLES.some((cycle) => cycle === value);
}

export function validateSubscription(input: SubscriptionDraft): Validation {
  const name = input.name.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (name.length === 0) return { ok: false, error: "구독 이름을 입력해 주세요." };
  if ([...name].length > 40) return { ok: false, error: "구독 이름은 40자까지 적을 수 있습니다." };
  if (!isCurrency(input.currency)) return { ok: false, error: "통화를 선택해 주세요." };
  if (!isCycle(input.cycle)) return { ok: false, error: "결제 주기를 선택해 주세요." };

  const amountMinor = parseAmountToMinor(input.amount, input.currency);
  if (amountMinor === null) {
    const hint = input.currency === "KRW" || input.currency === "JPY" ? "원 단위 정수로" : "소수점 둘째 자리까지";
    return { ok: false, error: `금액은 0보다 큰 값을 ${hint} 입력해 주세요.` };
  }

  if (!Number.isInteger(input.billingDay)) return { ok: false, error: "결제일을 확인해 주세요." };

  switch (input.cycle) {
    case "weekly":
      if (input.billingDay < 0 || input.billingDay > 6) return { ok: false, error: "요일을 선택해 주세요." };
      return {
        ok: true,
        value: { name, amountMinor, currency: input.currency, cycle: input.cycle, billingDay: input.billingDay, billingMonth: null },
      };
    case "monthly":
      if (input.billingDay < 1 || input.billingDay > 31) return { ok: false, error: "결제일은 1일부터 31일까지입니다." };
      return {
        ok: true,
        value: { name, amountMinor, currency: input.currency, cycle: input.cycle, billingDay: input.billingDay, billingMonth: null },
      };
    case "yearly": {
      if (input.billingDay < 1 || input.billingDay > 31) return { ok: false, error: "결제일은 1일부터 31일까지입니다." };
      if (input.billingMonth === null || !Number.isInteger(input.billingMonth) || input.billingMonth < 1 || input.billingMonth > 12) {
        return { ok: false, error: "매년 결제는 월을 선택해 주세요." };
      }
      return {
        ok: true,
        value: {
          name,
          amountMinor,
          currency: input.currency,
          cycle: input.cycle,
          billingDay: input.billingDay,
          billingMonth: input.billingMonth,
        },
      };
    }
    default: {
      const neverCycle: never = input.cycle;
      return { ok: false, error: `결제 주기를 선택해 주세요. ${neverCycle}` };
    }
  }
}
