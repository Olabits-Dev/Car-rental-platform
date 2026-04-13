import type { Metadata } from "next";
import Link from "next/link";
import { AuthShowcase } from "@/components/auth-showcase";
import { ResetPasswordForm } from "@/components/reset-password-form";
import {
  AuthServiceError,
  validatePasswordResetTokenWithAuthService,
} from "@/lib/backend-auth";

export const dynamic = "force-dynamic";

type ResetPasswordPathPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function generateMetadata({
  params,
}: ResetPasswordPathPageProps): Promise<Metadata> {
  await params; // Need params for signature but metadata is static
  return {
    title: "Reset Password",
    description: "Create a new RideFlex password from your secure reset link.",
  };
}

export default async function ResetPasswordPathPage({
  params,
}: ResetPasswordPathPageProps) {
  const { token: rawToken } = await params;
  const token = (rawToken ?? "").trim();

  if (!token) {
    return (
      <div className="page-shell py-8 md:py-12">
        <div className="grid items-stretch gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.82fr)]">
          <div className="glass-panel mx-auto flex h-full w-full max-w-[34rem] flex-col justify-center p-5 sm:p-6 md:p-8">
            <p className="section-kicker">Reset link missing</p>
            <h1 className="mt-3 font-[var(--font-display)] text-3xl leading-none tracking-tight text-[var(--heading)] sm:text-4xl">
              That reset link is incomplete
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Request a fresh password reset email and use the new secure link.
            </p>
            <Link href="/forgot-password" className="button-primary mt-6 w-fit">
              Request reset link
            </Link>
          </div>
          <div className="lg:order-first">
            <AuthShowcase mode="login" />
          </div>
        </div>
      </div>
    );
  }

  let result:
    | {
        email: string;
        expiresAt: string;
      }
    | null = null;
  let errorMessage: string | null = null;

  try {
    result = await validatePasswordResetTokenWithAuthService(token);
  } catch (error) {
    errorMessage =
      error instanceof AuthServiceError &&
      error.statusCode === 400
        ? "This reset link is invalid or has expired. Request a fresh one to continue."
        : "We could not verify that reset link right now. Please try again in a moment.";
  }

  if (errorMessage) {
    return (
      <div className="page-shell py-8 md:py-12">
        <div className="grid items-stretch gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.82fr)]">
          <div className="glass-panel mx-auto flex h-full w-full max-w-[34rem] flex-col justify-center p-5 sm:p-6 md:p-8">
            <p className="section-kicker">Reset link issue</p>
            <h1 className="mt-3 font-[var(--font-display)] text-3xl leading-none tracking-tight text-[var(--heading)] sm:text-4xl">
              We could not open that reset link
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{errorMessage}</p>
            <Link href="/forgot-password" className="button-primary mt-6 w-fit">
              Request another link
            </Link>
          </div>
          <div className="lg:order-first">
            <AuthShowcase mode="login" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="grid items-stretch gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.82fr)]">
        <ResetPasswordForm token={token} maskedEmail={result?.email ?? ""} />
        <div className="lg:order-first">
          <AuthShowcase mode="login" />
        </div>
      </div>
    </div>
  );
}
