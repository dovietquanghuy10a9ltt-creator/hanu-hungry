import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/AuthForms";
import { safeReturnPath } from "@/lib/auth/validation";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell>
      <LoginForm next={safeReturnPath(params.next)} resetDone={params.reset === "done"} />
    </AuthShell>
  );
}
