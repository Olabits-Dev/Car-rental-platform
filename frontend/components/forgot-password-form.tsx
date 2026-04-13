"use client";

import Link from "next/link";
import { useState } from "react";
import { apiClient, ApiClientError } from "@/lib/api-client";

type ForgotPasswordFormState = {
  email: string;
};

const initialState: ForgotPasswordFormState = {
  email: "",
};

export function ForgotPasswordForm() {
  const [form, setForm] = useState<ForgotPasswordFormState>(initialState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const payload = await apiClient.forgotPassword(form);
      setCompleted(true);
      setPreviewUrl(payload.previewUrl ?? null);
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
      <div className="space-y-3">
        <span className="inline-flex w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Password help
        </span>
        <p className="section-kicker">Recover access</p>
        <h1 className="font-[var(--font-display)] text-3xl leading-none tracking-tight text-[var(--heading)] sm:text-4xl md:text-5xl">
          Reset your password with a secure link
        </h1>
        <p className="text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
          Enter the email linked to your RideFlex account and we will send a
          one-time reset link. Only registered accounts can use it.
        </p>
      </div>

      {completed ? (
        <div className="mt-6 rounded-[1.2rem] border border-[var(--panel-border)] bg-[var(--panel-subtle)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
          <p className="font-semibold text-[var(--heading)]">
            If that email is registered, a reset link is on its way.
          </p>
          <p className="mt-2">
            Check your inbox and spam folder, then follow the secure link to set
            a new password.
          </p>

          {previewUrl ? (
            <div className="mt-4 rounded-[1rem] border border-[var(--panel-border)] bg-[var(--panel-solid)] px-4 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Local preview
              </p>
              <a
                href={previewUrl}
                className="mt-2 block break-all font-medium text-[var(--heading)] underline underline-offset-4"
              >
                {previewUrl}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8">
        <label className="block">
          <span className="field-label">Email address</span>
          <div className="theme-input-shell mt-2 rounded-[1.2rem] px-4 py-4">
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder=\"your@email.com\"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
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

        <button type="submit" disabled={pending} className="button-primary w-full">
          {pending ? "Sending link..." : "Send reset link"}
        </button>

        <p className="text-sm leading-6 text-[var(--muted)]">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
            Return to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
