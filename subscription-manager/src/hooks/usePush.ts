import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { currentPushEndpoint, disablePush, enablePush, pushSupported } from "../lib/push.ts";
import type { PushUi } from "../pages/AlertsScreen.tsx";

const PREF_KEY = "subscription-manager-notify";

export function usePush(signedIn: boolean) {
  const [state, setState] = useState<PushUi>("unknown");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) {
      setState("unknown");
      return;
    }
    let cancel = false;
    void (async () => {
      if (!pushSupported()) {
        if (!cancel) setState("unsupported");
        return;
      }
      if (localStorage.getItem(PREF_KEY) === "off") {
        if (!cancel) setState("off");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancel) setState("denied");
        return;
      }
      if (Notification.permission !== "granted") {
        if (!cancel) setState("off");
        return;
      }
      const endpoint = await currentPushEndpoint().catch(() => null);
      if (cancel) return;
      setState(endpoint ? "on" : "local");
    })();
    return () => {
      cancel = true;
    };
  }, [signedIn]);

  async function enable() {
    setNote(null);
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    setState("busy");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      localStorage.setItem(PREF_KEY, "off");
      setState("denied");
      setNote("브라우저에서 알림을 허용해 주세요.");
      return;
    }
    localStorage.setItem(PREF_KEY, "on");
    try {
      const { publicKey } = await api.pushPublicKey();
      const subscription = await enablePush(publicKey);
      await api.savePush(subscription);
      await api.checkNotifications();
      setState("on");
      setNote("알림을 켰습니다. 결제 당일과 하루 전에 이 기기로 도착합니다.");
    } catch {
      setState("local");
      setNote("백그라운드 알림은 연결되지 않았습니다. 앱이 열려 있을 때 알림을 띄웁니다.");
    }
  }

  async function disable() {
    setNote(null);
    localStorage.setItem(PREF_KEY, "off");
    const endpoint = await disablePush().catch(() => null);
    await api.deletePush(endpoint).catch(() => undefined);
    setState("off");
    setNote("이 기기의 결제일 알림을 껐습니다.");
  }

  return { state, note, enable, disable };
}
