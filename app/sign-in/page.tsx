import { AuthForm } from "@/components/app/auth-form";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/studio");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm mode="sign-in" />
    </div>
  );
}
