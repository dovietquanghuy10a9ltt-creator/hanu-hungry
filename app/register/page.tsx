import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/AuthForms";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function RegisterPage() {
  const account = await getCurrentProfile();
  if (account) {
    redirect("/");
  }

  return <AuthShell><RegisterForm /></AuthShell>;
}
