import type { Currency } from "./types.ts";

export function exponent(currency: Currency): number {
  switch (currency) {
    case "KRW":
    case "JPY":
      return 0;
    case "USD":
    case "EUR":
      return 2;
    default: {
      const neverCurrency: never = currency;
      return neverCurrency;
    }
  }
}

export function formatMoney(minor: number, currency: Currency): string {
  const digits = exponent(currency);
  const value = minor / 10 ** digits;
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function minorToInput(minor: number, currency: Currency): string {
  const digits = exponent(currency);
  if (digits === 0) return String(minor);
  const whole = Math.trunc(minor / 100);
  const fraction = String(Math.abs(minor % 100)).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function parseAmountToMinor(raw: string, currency: Currency): number | null {
  const trimmed = raw.trim().replaceAll(",", "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const digits = exponent(currency);
  if (digits === 0 && trimmed.includes(".")) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const minor = digits === 0 ? Number(whole) : Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > 1_000_000_000_000) return null;
  return minor;
}
