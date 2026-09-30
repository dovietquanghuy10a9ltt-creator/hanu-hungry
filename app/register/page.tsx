import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/AuthForms";

export default function RegisterPage() {
  return <AuthShell><RegisterForm /></AuthShell>;
}
