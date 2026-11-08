import { ddayLabel, scheduleLabel } from "../../shared/billing.ts";
import { formatMoney } from "../../shared/money.ts";
import type { Summary } from "../../shared/types.ts";

export type PushUi = "unknown" | "off" | "on" | "denied" | "unsupported" | "local" | "busy";

interface AlertsScreenProps {
  summary: Summary;
  pushState: PushUi;
  note: string | null;
  onEnable: () => void;
  onDisable: () => void;
}

function statusCopy(state: PushUi): string {
  switch (state) {
    case "unknown":
    case "busy":
      return "알림 상태를 확인하고 있습니다.";
    case "off":
      return "결제 당일과 하루 전에 이 기기로 알립니다. 폰에서는 홈 화면에 추가한 뒤 알림을 허용해 주세요.";
    case "on":
      return "이 기기에서 결제일 알림을 받습니다. 결제 당일과 하루 전에 도착합니다.";
    case "local":
      return "알림 권한은 켜져 있습니다. 이 브라우저에서는 앱이 열려 있을 때 알림이 뜹니다. 폰의 홈 화면 앱에서 다시 켜면 백그라운드에도 도착합니다.";
    case "denied":
      return "브라우저가 알림을 막아 두었습니다. 사이트 설정에서 알림을 허용해 주세요. 목록의 D-day는 그대로 볼 수 있습니다.";
    case "unsupported":
      return "이 브라우저는 푸시 알림을 지원하지 않습니다. 목록의 D-day는 그대로 볼 수 있습니다.";
    default: {
      const neverState: never = state;
      return neverState;
    }
  }
}

export function AlertsScreen({ summary, pushState, note, onEnable, onDisable }: AlertsScreenProps) {
  const canEnable = pushState === "off" || pushState === "local";
  const canDisable = pushState === "on" || pushState === "local";

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">결제일 알림</h1>
        <p className="mt-1 text-sm leading-6 text-muted">{statusCopy(pushState)}</p>
      </div>
      <div className="flex gap-2">
        {canEnable ? (
          <button className="min-h-11 flex-1 rounded-xl bg-pine text-sm font-medium text-white" type="button" onClick={onEnable}>
            {pushState === "local" ? "백그라운드 알림 다시 켜기" : "알림 켜기"}
          </button>
        ) : null}
        {canDisable ? (
          <button className="min-h-11 rounded-xl border border-line px-4 text-sm" type="button" onClick={onDisable}>
            알림 끄기
          </button>
        ) : null}
        {pushState === "busy" ? <p className="text-sm text-muted">알림을 설정하는 중입니다.</p> : null}
      </div>
      {note ? (
        <p className="text-sm text-pine" role="status">
          {note}
        </p>
      ) : null}
      {summary.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper px-4 py-8 text-sm leading-6 text-muted">
          기록된 구독이 없으면 알릴 결제일이 없습니다.
        </div>
      ) : (
        <ul className="grid gap-3">
          {summary.items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-semibold ${item.dday === 0 ? "text-seal" : "text-pine"}`}>{ddayLabel(item.dday)}</p>
                  <p className="mt-1 font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {scheduleLabel(item)} · {item.nextPayment}
                  </p>
                </div>
                <p className="tabular-nums font-semibold">{formatMoney(item.amountMinor, item.currency)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
