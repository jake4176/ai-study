import { useState } from "react";
import { formatMoney } from "../../shared/money.ts";
import type { Currency, Summary } from "../../shared/types.ts";
import { SpendChart } from "../components/SpendChart.tsx";

interface DashboardScreenProps {
  summary: Summary;
}

function monthTitle(month: string): string {
  const [year, rawMonth] = month.split("-");
  return `${year}년 ${Number(rawMonth)}월`;
}

export function DashboardScreen({ summary }: DashboardScreenProps) {
  const [picked, setPicked] = useState<Currency | null>(null);
  const selected = summary.totals.some((total) => total.currency === picked) ? picked : (summary.totals[0]?.currency ?? null);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">월 지출</h1>
        <p className="mt-1 text-sm text-muted">{monthTitle(summary.month)} · 서울 기준</p>
      </div>
      {summary.totals.length === 0 || selected === null ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-8 text-sm leading-6 text-muted">
          구독을 기록하면 이번 달 합계와 차트가 나타납니다.
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {summary.totals.map((total) => (
              <section key={total.currency} className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-sm text-muted">이번 달 결제 합계 · {total.currency}</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{formatMoney(total.thisMonthMinor, total.currency)}</p>
              </section>
            ))}
          </div>
          <section className="rounded-2xl border border-line bg-paper p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">월 환산</h2>
              {summary.totals.length > 1 ? (
                <div className="flex gap-1">
                  {summary.totals.map((total) => (
                    <button
                      key={total.currency}
                      className={`min-h-9 rounded-lg px-2 text-xs ${total.currency === selected ? "bg-pine text-white" : "border border-line"}`}
                      type="button"
                      onClick={() => setPicked(total.currency)}
                    >
                      {total.currency}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <SpendChart items={summary.items} currency={selected} />
            <p className="mt-4 text-xs leading-5 text-muted">
              막대는 월 환산입니다. 매주는 1년 52주를 12로 나누고, 매년은 12로 나눕니다. 원 단위는 반올림합니다. 위의 합계는 이번 달에 실제로 결제되는 금액입니다.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
