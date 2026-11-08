import { useState } from "react";
import { ddayLabel, scheduleLabel, seoulToday } from "../../shared/billing.ts";
import { formatMoney, minorToInput } from "../../shared/money.ts";
import type { SubscriptionDraft, SubscriptionView } from "../../shared/types.ts";
import { validateSubscription } from "../../shared/validate.ts";
import { SubscriptionForm } from "../components/SubscriptionForm.tsx";

interface ListScreenProps {
  items: SubscriptionView[];
  onSave: (draft: SubscriptionDraft, id: number | null) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function blankDraft(): SubscriptionDraft {
  const today = seoulToday();
  return { name: "", amount: "", currency: "KRW", cycle: "monthly", billingDay: today.d, billingMonth: today.m };
}

function draftFrom(item: SubscriptionView): SubscriptionDraft {
  return {
    name: item.name,
    amount: minorToInput(item.amountMinor, item.currency),
    currency: item.currency,
    cycle: item.cycle,
    billingDay: item.billingDay,
    billingMonth: item.billingMonth,
  };
}

export function ListScreen({ items, onSave, onDelete }: ListScreenProps) {
  const [open, setOpen] = useState(items.length === 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SubscriptionDraft>(blankDraft);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function startCreate() {
    setEditingId(null);
    setDraft(blankDraft());
    setError(null);
    setOpen(true);
  }

  function startEdit(item: SubscriptionView) {
    setEditingId(item.id);
    setDraft(draftFrom(item));
    setError(null);
    setOpen(true);
  }

  async function submit() {
    const parsed = validateSubscription(draft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(draft, editingId);
      setOpen(false);
      setEditingId(null);
      setDraft(blankDraft());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(id);
      setConfirmId(null);
      if (editingId === id) {
        setOpen(false);
        setEditingId(null);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "지우지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">구독 목록</h1>
          <p className="mt-1 text-sm text-muted">{items.length === 0 ? "아직 없습니다" : `${items.length}개`}</p>
        </div>
        <button className="min-h-11 rounded-xl bg-pine px-4 text-sm font-medium text-white" type="button" onClick={startCreate}>
          구독 기록
        </button>
      </div>
      {open ? (
        <SubscriptionForm
          draft={draft}
          editing={editingId !== null}
          saving={saving}
          error={error}
          onChange={setDraft}
          onSubmit={() => void submit()}
          onCancel={() => {
            setOpen(false);
            setEditingId(null);
            setError(null);
          }}
        />
      ) : null}
      {error && !open ? (
        <p className="text-sm text-seal" role="alert">
          {error}
        </p>
      ) : null}
      {items.length === 0 && !open ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-8 text-sm leading-6 text-muted">
          아직 기록한 구독이 없습니다. 이름, 금액, 통화, 결제 주기, 결제일을 적으면 이번 달 지출과 결제일이 여기에 모입니다.
        </div>
      ) : null}
      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{scheduleLabel(item)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${item.dday === 0 ? "text-seal" : "text-pine"}`}>{ddayLabel(item.dday)}</p>
                <p className="mt-1 text-base font-semibold tabular-nums">{formatMoney(item.amountMinor, item.currency)}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="min-h-11 rounded-xl border border-line px-3 text-sm" type="button" onClick={() => startEdit(item)}>
                고치기
              </button>
              {confirmId === item.id ? (
                <>
                  <button
                    className="min-h-11 rounded-xl bg-seal px-3 text-sm text-white disabled:opacity-60"
                    type="button"
                    disabled={deleting}
                    onClick={() => void remove(item.id)}
                  >
                    {deleting ? "지우는 중" : "지우기"}
                  </button>
                  <button className="min-h-11 px-3 text-sm text-muted" type="button" onClick={() => setConfirmId(null)}>
                    취소
                  </button>
                </>
              ) : (
                <button className="min-h-11 rounded-xl border border-line px-3 text-sm" type="button" onClick={() => setConfirmId(item.id)}>
                  지우기
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
