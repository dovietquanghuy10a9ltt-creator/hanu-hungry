import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/AuthForms";
import { safeReturnPath } from "@/lib/auth/validation";
import { getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description:
    "Đăng nhập tài khoản sinh viên Hanu Hungry để lưu nhật ký ăn uống, tích lũy chuỗi ngày ghé quán và đánh giá trải nghiệm thực tế.",
  alternates: {
    canonical: "https://hanuhungry.id.vn/login",
  },
};

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
