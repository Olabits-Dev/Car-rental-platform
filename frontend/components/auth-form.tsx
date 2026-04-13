"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiClientError } from "@/lib/api-client";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo: string;
};

type AuthState = {
  name: string;
  email: string;
  password: string;
};

const baseState: AuthState = {
  name: "",
  email: "",
  password: "",
};

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AuthState>(baseState);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isLogin = mode === "login";
  const loginHref =
    redirectTo === "/dashboard" ? "/login" : `/login?redirect=${encodeURIComponent(redirectTo)}`;
  const registerHref =
    redirectTo === "/dashboard"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirectTo)}`;
  const helperPoints = isLogin
    ? ["Upcoming trips", "Past bookings", "Faster repeat checkout"]
    : ["Instant sign-in", "Trip dashboard", "Future bookings in one place"];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      if (mode === "login") {
        await apiClient.login(form);
      } else {
        await apiClient.register(form);
      }

      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="glass-panel mx-auto flex h-full w-full max-w-[34rem] flex-col p-5 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2" aria-label="Authentication mode">
          <Link
            href={loginHref}
            aria-current={isLogin ? "page" : undefined}
            className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition ${
              isLogin
                ? "bg-[#fff1f4] text-[#d61032] shadow-[inset_0_-2px_0_#d61032]"
                : "text-[#212121] hover:bg-[#fff6f8] hover:text-[#d61032]"
            }`}
          >
            Sign in
          </Link>
          <Link
            href={registerHref}
            aria-current={!isLogin ? "page" : undefined}
            className={`rounded-[0.9rem] px-4 py-2 text-sm font-semibold transition ${
              !isLogin
                ? "bg-[#fff1f4] text-[#d61032] shadow-[inset_0_-2px_0_#d61032]"
                : "text-[#212121] hover:bg-[#fff6f8] hover:text-[#d61032]"
            }`}
          >
            Join
          </Link>
        </nav>

        <span className="rounded-full bg-[#fff5f7] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#d61032]">
          Secure customer access
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <p className="section-kicker">{isLogin ? "Welcome back" : "Create your account"}</p>
        <h1 className="font-[var(--font-display)] text-3xl leading-none tracking-tight text-[#111111] sm:text-4xl md:text-5xl">
          {isLogin ? "Sign in with confidence" : "Join and book with less friction"}
        </h1>
        <p className="text-sm leading-6 text-[#616161] sm:text-base sm:leading-7">
          {isLogin
            ? "Access saved bookings, manage upcoming trips, and move through checkout with a cleaner, more professional customer flow."
            : "Create your account once so future reservations, dashboards, and trip details stay connected from the first booking onward."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-3">
        {helperPoints.map((point) => (
          <div
            key={point}
            className="whitespace-nowrap rounded-[0.9rem] border border-[#ececec] bg-[#fafafa] px-3 py-2 text-[0.78rem] font-medium text-[#3e3e3e] sm:rounded-[1.15rem] sm:px-4 sm:py-3 sm:text-sm sm:whitespace-normal"
          >
            {point}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8">
        {!isLogin ? (
          <label className="block">
            <span className="field-label">Full name</span>
            <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Alex Carter"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="field-input"
              />
            </div>
          </label>
        ) : null}

        <label className="block">
          <span className="field-label">Email address</span>
          <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="field-input"
            />
          </div>
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <div className="mt-2 rounded-[1.2rem] border border-[#dddddd] bg-[#fcfcfc] px-4 py-4 transition focus-within:border-[#d61032] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,16,50,0.08)]">
            <input
              required
              minLength={8}
              type="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "••••••••" : "Minimum 8 characters"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="field-input"
            />
          </div>
          <p className="mt-2 text-sm text-[#767676]">
            {isLogin
              ? "Use the password attached to your RideFlex account."
              : "Use at least 8 characters so your account feels secure from the start."}
          </p>
        </label>

        {error ? (
          <>
            <p
              aria-live="polite"
              className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
            {isLogin ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Forgot your password?{' '}
                <Link
                  href="/forgot-password"
                  className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Reset it now.
                </Link>
              </p>
            ) : null}
          </>
        ) : null}

        <button type="submit" disabled={pending} className="button-primary mt-2 w-full">
          {pending
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>

        <p className="text-sm leading-6 text-[#666666]">
          {isLogin ? "New to RideFlex?" : "Already have an account?"}{" "}
          <Link
            href={isLogin ? registerHref : loginHref}
            className="font-semibold text-[#d61032] hover:text-[#b30828]"
          >
            {isLogin ? "Join here" : "Sign in instead"}
          </Link>
        </p>
      </form>
    </div>
  );
}
