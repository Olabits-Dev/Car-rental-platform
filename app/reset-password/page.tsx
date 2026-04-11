import type { Metadata } from "next";
import { redirect } from "next/navigation";

type ResetPasswordPageProps = {
  searchParams: {
    token?: string | string[];
  };
};

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new RideFlex password from your secure reset link.",
};

function normalizeQueryToken(token?: string | string[]) {
  if (!token) {
    return "";
  }

  if (Array.isArray(token)) {
    return token[0]?.trim() ?? "";
  }

  return token.trim();
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token = normalizeQueryToken(searchParams.token);

  if (token) {
    redirect(`/reset-password/${encodeURIComponent(token)}`);
  }

  redirect("/forgot-password");
}
