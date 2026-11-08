import { seoulToday, WEEKDAYS } from "../../shared/billing.ts";
import type { Cycle, Currency, SubscriptionDraft } from "../../shared/types.ts";
import { CURRENCIES, CYCLES } from "../../shared/types.ts";

interface SubscriptionFormProps {
  draft: SubscriptionDraft;
  editing: boolean;
  saving: boolean;
  error: string | null;
  onChange: (draft: SubscriptionDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const CURRENCY_LABEL: Record<Currency, string> = {
  KRW: "원 (KRW)",
  USD: "달러 (USD)",
  EUR: "유로 (EUR)",
  JPY: "엔 (JPY)",
};

const CYCLE_LABEL: Record<Cycle, string> = {
  weekly: "매주",
  monthly: "매월",
  yearly: "매년",
};

export function SubscriptionForm({ draft, editing, saving, error, onChange, onSubmit, onCancel }: SubscriptionFormProps) {
  const decimal = draft.currency === "USD" || draft.currency === "EUR";

  function changeCycle(cycle: Cycle) {
    const today = seoulToday();
    onChange({
      ...draft,
      cycle,
      billingDay: cycle === "weekly" ? today.weekday : Math.min(Math.max(draft.billingDay, 1), 31),
      billingMonth: cycle === "yearly" ? (draft.billingMonth ?? today.m) : null,
    });
  }

  return (
    <form
      autoComplete="off"
      className="rounded-2xl border border-line bg-paper p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2 className="text-lg font-semibold">{editing ? "구독 고치기" : "구독 기록"}</h2>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span>이름</span>
          <input
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
            value={draft.name}
            name="subscription-name"
            autoComplete="off"
            maxLength={40}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
            placeholder="넷플릭스"
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span>금액</span>
            <input
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-base tabular-nums"
              value={draft.amount}
              name="subscription-amount"
              autoComplete="off"
              inputMode={decimal ? "decimal" : "numeric"}
              onChange={(event) => onChange({ ...draft, amount: event.target.value })}
              placeholder={decimal ? "9.99" : "13500"}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>통화</span>
            <select
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
              value={draft.currency}
              onChange={(event) => {
                const currency = CURRENCIES.find((item) => item === event.target.value) ?? draft.currency;
                onChange({ ...draft, currency });
              }}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {CURRENCY_LABEL[currency]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span>결제 주기</span>
          <select
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
            value={draft.cycle}
            onChange={(event) => {
              const cycle = CYCLES.find((item) => item === event.target.value);
              if (cycle) changeCycle(cycle);
            }}
          >
            {CYCLES.map((cycle) => (
              <option key={cycle} value={cycle}>
                {CYCLE_LABEL[cycle]}
              </option>
            ))}
          </select>
        </label>
        {draft.cycle === "weekly" ? (
          <label className="grid gap-1 text-sm">
            <span>결제일</span>
            <select
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
              value={draft.billingDay}
              onChange={(event) => onChange({ ...draft, billingDay: Number(event.target.value) })}
            >
              {WEEKDAYS.map((label, index) => (
                <option key={label} value={index}>
                  {label}요일
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {draft.cycle === "yearly" ? (
              <label className="grid gap-1 text-sm">
                <span>결제 월</span>
                <select
                  className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
                  value={draft.billingMonth ?? 1}
                  onChange={(event) => onChange({ ...draft, billingMonth: Number(event.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <option key={month} value={month}>
                      {month}월
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="grid gap-1 text-sm">
              <span>결제일</span>
              <select
                className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
                value={draft.billingDay}
                onChange={(event) => onChange({ ...draft, billingDay: Number(event.target.value) })}
              >
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}일
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-seal" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <button className="min-h-11 flex-1 rounded-xl bg-pine px-4 text-base font-medium text-white disabled:opacity-60" type="submit" disabled={saving}>
          {saving ? "저장 중" : "저장"}
        </button>
        <button className="min-h-11 rounded-xl border border-line px-4 text-base" type="button" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}
