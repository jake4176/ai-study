import type { ReactNode } from "react";
import { IconBell, IconChart, IconList } from "./Icons.tsx";

export type Tab = "list" | "dashboard" | "alerts";

interface ShellProps {
  email: string;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onLogout: () => void;
  children: ReactNode;
}

const TABS: { id: Tab; label: string; icon: typeof IconList }[] = [
  { id: "list", label: "목록", icon: IconList },
  { id: "dashboard", label: "지출", icon: IconChart },
  { id: "alerts", label: "알림", icon: IconBell },
];

export function Shell({ email, tab, onTab, onLogout, children }: ShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-sand/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">구독 매니저</p>
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
          <button className="min-h-11 shrink-0 text-sm text-muted" type="button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((item) => {
            const active = item.id === tab;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${active ? "font-semibold text-pine" : "text-muted"}`}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onTab(item.id)}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
