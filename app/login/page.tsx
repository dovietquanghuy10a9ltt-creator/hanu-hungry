import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/AuthForms";
import { safeReturnPath } from "@/lib/auth/validation";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const account = await getCurrentProfile();
  const params = await searchParams;
  const returnPath = safeReturnPath(params.next);

  if (account) {
    redirect(returnPath || "/");
  }

  return (
    <AuthShell>
      <LoginForm next={returnPath} resetDone={params.reset === "done"} />
    </AuthShell>
  );
}
