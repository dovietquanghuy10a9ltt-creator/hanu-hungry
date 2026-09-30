import { AuthShell } from "@/features/auth/components/AuthShell";
import { ChangePasswordForm } from "@/features/auth/components/AuthForms";
import { requireUser } from "@/lib/auth/session";

export default async function ChangePasswordPage() {
  await requireUser();
  return <AuthShell><ChangePasswordForm /></AuthShell>;
}
