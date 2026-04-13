import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShowcase } from "@/components/auth-showcase";
import { getSafeRedirectPath, type SearchParamRecord } from "@/lib/query";
import { getCurrentUser } from "@/lib/session";

type RegisterPageProps = {
  searchParams: Promise<SearchParamRecord>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  const redirectTo = getSafeRedirectPath((await searchParams).redirect);

  return (
    <div className="page-shell py-8 md:py-12">
      <div className="grid items-stretch gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.82fr)]">
        <AuthForm mode="register" redirectTo={redirectTo} />
        <div className="lg:order-first">
          <AuthShowcase mode="register" />
        </div>
      </div>
    </div>
  );
}
