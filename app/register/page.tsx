import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/AuthForms";
import { getCurrentProfile } from "@/lib/auth/session";
import { generateFormGuardToken } from "@/lib/security/form-guard";

export default async function RegisterPage() {
  const account = await getCurrentProfile();
  if (account) {
    redirect("/");
  }

  const guardToken = generateFormGuardToken();

  return (
    <AuthShell>
      <RegisterForm guardToken={guardToken} />
    </AuthShell>
  );
}
