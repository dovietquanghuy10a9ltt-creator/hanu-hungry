"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { AuthActionState } from "@/features/auth/actions";
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/features/auth/actions";

const initialState: AuthActionState = { status: "idle", message: "" };
const inputClass = "mt-1.5 min-h-12 w-full rounded-xl border border-[#e5d7d2] bg-white px-4 text-base text-[#28201e] outline-none transition focus:border-[#d62737] focus:ring-2 focus:ring-[#d62737]/15";
const labelClass = "block text-sm font-semibold text-[#493c38]";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-[#c51f30] px-5 py-3 text-base font-bold text-white transition hover:bg-[#a91828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c51f30] disabled:cursor-wait disabled:opacity-65">
      {pending ? "Đang xử lý..." : children}
    </button>
  );
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return (
    <p role={state.status === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${state.status === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
      {state.message}
    </p>
  );
}

function PasswordField({ name, label, autoComplete = "new-password", minLength }: {
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className={labelClass}>
      {label}
      <span className="relative block">
        <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} required className={`${inputClass} pr-16`} />
        <button type="button" onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-1 mt-1.5 min-h-11 rounded-lg px-3 text-sm font-semibold text-[#8b2530] focus-visible:outline-2 focus-visible:outline-[#c51f30]" aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}>
          {visible ? "Ẩn" : "Hiện"}
        </button>
      </span>
    </label>
  );
}

export function LoginForm({ next, resetDone }: { next: string; resetDone: boolean }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Chào mừng trở lại</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Đăng nhập để lưu trải nghiệm ăn uống của bạn.</p>
      {resetDone && <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.</p>}
      <form action={action} className="mt-7 space-y-5">
        <input type="hidden" name="next" value={next} />
        <label className={labelClass}>Email
          <input name="email" type="email" autoComplete="email" inputMode="email" required className={inputClass} placeholder="tenban@email.com" />
        </label>
        <PasswordField name="password" label="Mật khẩu" autoComplete="current-password" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-medium">
            <input name="remember" type="checkbox" defaultChecked className="h-5 w-5 accent-[#c51f30]" />
            Ghi nhớ đăng nhập
          </label>
          <Link href="/forgot-password" className="inline-flex min-h-11 items-center font-semibold text-[#b51b2c] underline-offset-4 hover:underline">Quên mật khẩu?</Link>
        </div>
        <FormMessage state={state} />
        <SubmitButton>Đăng nhập</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-[#756561]">Chưa có tài khoản? <Link href="/register" className="font-bold text-[#b51b2c] hover:underline">Đăng ký</Link></p>
    </>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState);
  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Tạo tài khoản</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Tham gia HANU Hungry bằng email và MSSV của bạn.</p>
      <form action={action} className="mt-7 space-y-5">
        <label className={labelClass}>MSSV
          <input name="student_code" type="text" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="MSSV gồm đúng 10 chữ số" autoComplete="off" required className={inputClass} placeholder="10 chữ số" />
        </label>
        <label className={labelClass}>Email
          <input name="email" type="email" inputMode="email" autoComplete="email" required className={inputClass} placeholder="tenban@email.com" />
        </label>
        <PasswordField name="password" label="Mật khẩu" minLength={8} />
        <PasswordField name="confirm_password" label="Nhập lại mật khẩu" minLength={8} />
        <p className="text-xs text-[#756561]">Mật khẩu cần ít nhất 8 ký tự. Tên hiển thị mặc định lấy từ phần trước @ trong email.</p>
        <FormMessage state={state} />
        <SubmitButton>Đăng ký</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-[#756561]">Đã có tài khoản? <Link href="/login" className="font-bold text-[#b51b2c] hover:underline">Đăng nhập</Link></p>
    </>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialState);
  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Quên mật khẩu</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Nhập email và MSSV thuộc cùng tài khoản để nhận liên kết đặt lại mật khẩu.</p>
      <form action={action} className="mt-7 space-y-5">
        <label className={labelClass}>Email
          <input name="email" type="email" inputMode="email" autoComplete="email" required className={inputClass} />
        </label>
        <label className={labelClass}>MSSV
          <input name="student_code" type="text" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="MSSV gồm đúng 10 chữ số" required className={inputClass} />
        </label>
        <FormMessage state={state} />
        <SubmitButton>Gửi liên kết đặt lại</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-bold text-[#b51b2c] hover:underline">Quay lại đăng nhập</Link></p>
    </>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialState);
  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Đặt mật khẩu mới</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Mật khẩu mới cần ít nhất 8 ký tự.</p>
      <form action={action} className="mt-7 space-y-5">
        <PasswordField name="password" label="Mật khẩu mới" minLength={8} />
        <PasswordField name="confirm_password" label="Nhập lại mật khẩu mới" minLength={8} />
        <FormMessage state={state} />
        <SubmitButton>Lưu mật khẩu mới</SubmitButton>
      </form>
    </>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);
  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Đổi mật khẩu</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Nhập mật khẩu hiện tại để xác nhận thay đổi.</p>
      <form action={action} className="mt-7 space-y-5">
        <PasswordField name="current_password" label="Mật khẩu hiện tại" autoComplete="current-password" />
        <PasswordField name="password" label="Mật khẩu mới" minLength={8} />
        <PasswordField name="confirm_password" label="Nhập lại mật khẩu mới" minLength={8} />
        <FormMessage state={state} />
        <SubmitButton>Đổi mật khẩu</SubmitButton>
      </form>
    </>
  );
}
