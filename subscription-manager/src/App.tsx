import { useEffect, useState } from "react";
import type { SubscriptionDraft, Summary, User } from "../shared/types.ts";
import { api } from "./api.ts";
import { Shell, type Tab } from "./components/Shell.tsx";
import { usePush } from "./hooks/usePush.ts";
import { notifyOpenItems } from "./lib/local-notify.ts";
import { AlertsScreen } from "./pages/AlertsScreen.tsx";
import { AuthScreen } from "./pages/AuthScreen.tsx";
import { DashboardScreen } from "./pages/DashboardScreen.tsx";
import { ListScreen } from "./pages/ListScreen.tsx";

function readTab(): Tab {
  const value = new URLSearchParams(window.location.search).get("tab");
  switch (value) {
    case "dashboard":
    case "alerts":
      return value;
    case "list":
    case null:
      return "list";
    default:
      return "list";
  }
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(readTab);
  const push = usePush(Boolean(user));

  useEffect(() => {
    let cancel = false;
    api
      .me()
      .then((result) => {
        if (!cancel) setUser(result.user);
      })
      .catch(() => {
        if (!cancel) setUser(null);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    setSummaryError(null);
    api
      .summary()
      .then((result) => {
        if (!cancel) setSummary(result.summary);
      })
      .catch((caught: unknown) => {
        if (!cancel) setSummaryError(caught instanceof Error ? caught.message : "구독을 불러오지 못했습니다.");
      });
    return () => {
      cancel = true;
    };
  }, [user]);

  useEffect(() => {
    if (!summary || push.state !== "local") return;
    notifyOpenItems(summary.items, summary.today);
  }, [summary, push.state]);

  function selectTab(next: Tab) {
    const url = new URL(window.location.href);
    if (next === "list") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
    setTab(next);
  }

  async function reloadSummary() {
    setSummaryError(null);
    const result = await api.summary();
    setSummary(result.summary);
  }

  async function save(draft: SubscriptionDraft, id: number | null) {
    const result = id === null ? await api.createSubscription(draft) : await api.updateSubscription(id, draft);
    setSummary(result.summary);
  }

  async function remove(id: number) {
    const result = await api.deleteSubscription(id);
    setSummary(result.summary);
  }

  if (user === undefined) {
    return <p className="px-5 py-10 text-sm text-muted">불러오는 중</p>;
  }

  if (!user) {
    return (
      <AuthScreen
        onSignup={async (email, password) => {
          const result = await api.signup(email, password);
          setSummary(null);
          setUser(result.user);
        }}
        onLogin={async (email, password) => {
          const result = await api.login(email, password);
          setSummary(null);
          setUser(result.user);
        }}
      />
    );
  }

  let body = <p className="text-sm text-muted">불러오는 중</p>;
  if (summaryError) {
    body = (
      <div className="rounded-2xl border border-line bg-paper p-4" role="alert">
        <p className="text-sm">{summaryError}</p>
        <button
          className="mt-3 min-h-11 rounded-xl bg-pine px-4 text-sm text-white"
          type="button"
          onClick={() => {
            void reloadSummary().catch((caught: unknown) => {
              setSummaryError(caught instanceof Error ? caught.message : "구독을 불러오지 못했습니다.");
            });
          }}
        >
          다시 불러오기
        </button>
      </div>
    );
  } else if (summary) {
    switch (tab) {
      case "list":
        body = <ListScreen items={summary.items} onSave={save} onDelete={remove} />;
        break;
      case "dashboard":
        body = <DashboardScreen summary={summary} />;
        break;
      case "alerts":
        body = (
          <AlertsScreen
            summary={summary}
            pushState={push.state}
            note={push.note}
            onEnable={() => void push.enable()}
            onDisable={() => void push.disable()}
          />
        );
        break;
      default: {
        const neverTab: never = tab;
        body = neverTab;
      }
    }
  }

  return (
    <Shell
      email={user.email}
      tab={tab}
      onTab={selectTab}
      onLogout={() => {
        void api.logout().finally(() => {
          setUser(null);
          setSummary(null);
        });
      }}
    >
      {body}
    </Shell>
  );
}
