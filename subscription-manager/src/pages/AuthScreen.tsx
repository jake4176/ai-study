import { useState } from "react";

interface AuthScreenProps {
  onSignup: (email: string, password: string) => Promise<void>;
  onLogin: (email: string, password: string) => Promise<void>;
}

type Mode = "signup" | "login";

export function AuthScreen({ onSignup, onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      if (mode === "signup") await onSignup(email, password);
      else await onLogin(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm font-medium text-pine">구독 매니저</p>
      <h1 className="mt-2 text-3xl font-semibold leading-snug tracking-tight">구독을 한곳에 모아 지출을 보이게 합니다</h1>
      <p className="mt-3 text-sm leading-6 text-muted">가입하면 자기 구독만 보입니다. 결제 당일과 하루 전에 이 기기로 알림이 옵니다.</p>
      <form
        className="mt-8 rounded-2xl border border-line bg-paper p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-sand p-1">
          <button
            className={`min-h-11 rounded-lg text-sm ${mode === "signup" ? "bg-paper font-semibold" : "text-muted"}`}
            type="button"
            onClick={() => setMode("signup")}
          >
            가입
          </button>
          <button
            className={`min-h-11 rounded-lg text-sm ${mode === "login" ? "bg-paper font-semibold" : "text-muted"}`}
            type="button"
            onClick={() => setMode("login")}
          >
            로그인
          </button>
        </div>
        <label className="mt-4 grid gap-1 text-sm">
          <span>이메일</span>
          <input
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="mt-3 grid gap-1 text-sm">
          <span>비밀번호</span>
          <input
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-base"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <p className="mt-2 text-xs text-muted">비밀번호는 8자 이상입니다.</p>
        {error ? (
          <p className="mt-3 text-sm text-seal" role="alert">
            {error}
          </p>
        ) : null}
        <button className="mt-4 min-h-11 w-full rounded-xl bg-pine text-base font-medium text-white disabled:opacity-60" type="submit" disabled={pending}>
          {pending ? "확인 중" : mode === "signup" ? "가입하고 시작" : "로그인"}
        </button>
      </form>
    </main>
  );
}
