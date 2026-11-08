import { formatMoney } from "../../shared/money.ts";
import type { Currency, SubscriptionView } from "../../shared/types.ts";

interface SpendChartProps {
  items: SubscriptionView[];
  currency: Currency;
}

export function SpendChart({ items, currency }: SpendChartProps) {
  const rows = items
    .filter((item) => item.currency === currency)
    .slice()
    .sort((a, b) => b.monthlyEquivalentMinor - a.monthlyEquivalentMinor || a.name.localeCompare(b.name, "ko"));
  const max = rows.reduce((highest, row) => Math.max(highest, row.monthlyEquivalentMinor), 1);

  return (
    <div className="grid gap-3" role="img" aria-label={`${currency} 월 환산 지출 차트`}>
      {rows.map((row) => {
        const width = Math.max(4, Math.round((row.monthlyEquivalentMinor / max) * 100));
        return (
          <div key={row.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{row.name}</span>
              <span className="shrink-0 tabular-nums">{formatMoney(row.monthlyEquivalentMinor, currency)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-line">
              <div className="h-2.5 rounded-full bg-pine" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
