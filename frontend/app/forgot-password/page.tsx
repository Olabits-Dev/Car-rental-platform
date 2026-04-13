import type { Metadata } from "next";
import { AuthShowcase } from "@/components/auth-showcase";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a secure RideFlex password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="page-shell py-8 md:py-12">
      <div className="grid items-stretch gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.82fr)]">
        <ForgotPasswordForm />
        <div className="lg:order-first">
          <AuthShowcase mode="login" />
        </div>
      </div>
    </div>
  );
}
