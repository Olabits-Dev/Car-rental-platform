"use client";

import Link from "next/link";
import { useState } from "react";

type ResetPasswordFormProps = {
  token: string;
  maskedEmail: string;
};

export function ResetPasswordForm({
  token,
  maskedEmail,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.trim().length < 8) {
      setError("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The password confirmation does not match.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We could not reset the password.");
        return;
      }

      setCompleted(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="glass-panel mx-auto flex h-full w-full max-w-[34rem] flex-col p-5 sm:p-6 md:p-8">
      <div className="space-y-3">
        <span className="inline-flex w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Secure reset
        </span>
        <p className="section-kicker">Choose a new password</p>
        <h1 className="font-[var(--font-display)] text-3xl leading-none tracking-tight text-[var(--heading)] sm:text-4xl md:text-5xl">
          Set a new password
        </h1>
        <div className="pt-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Resetting password for</p>
          <p className="mt-1 text-lg font-semibold text-[var(--heading)] break-all">{maskedEmail}</p>
        </div>
        <p className="text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
          This link is one-time only. Once you save the new password, we will
          close older sessions for safety.
        </p>
      </div>

      {completed ? (
        <div className="mt-6 rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
          <p className="font-semibold">Password updated.</p>
          <p className="mt-2">
            You can sign back in now with the new password.
          </p>
          <Link href="/login" className="mt-4 inline-flex font-semibold text-emerald-900 underline underline-offset-4">
            Go to sign in
          </Link>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8">
        <label className="block">
          <span className="field-label">New password</span>
          <div className="theme-input-shell mt-2 rounded-[1.2rem] px-4 py-4">
            <input
              required
              minLength={8}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
            />
          </div>
        </label>

        <label className="block">
          <span className="field-label">Confirm password</span>
          <div className="theme-input-shell mt-2 rounded-[1.2rem] px-4 py-4">
            <input
              required
              minLength={8}
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat the new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="field-input"
            />
          </div>
        </label>

        {error ? (
          <p
            aria-live="polite"
            className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending || completed} className="button-primary w-full">
          {pending ? "Updating password..." : "Save new password"}
        </button>

        <p className="text-sm leading-6 text-[var(--muted)]">
          Need a fresh link?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Request another reset email
          </Link>
        </p>
      </form>
    </div>
  );
}
