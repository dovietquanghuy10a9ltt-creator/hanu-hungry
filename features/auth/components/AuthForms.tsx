"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { AuthActionState } from "@/features/auth/actions";
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  verifyRecoveryOtpAction,
} from "@/features/auth/actions";

const initialState: AuthActionState = { status: "idle", message: "" };
const inputClass = "field mt-2";
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
      <span className="relative mt-2 flex items-center">
        <input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="field w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-md text-[#8b2530] transition hover:bg-[#fae6e6] hover:text-[#c51f30] focus-visible:outline-2 focus-visible:outline-[#c51f30]"
          aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          title={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
        >
          {visible ? (
            /* Mắt mở */
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            /* Mắt nhắm / gạch chéo */
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
              <path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 2.898-4.254" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}

function saveRegisteredMssv(code: string) {
  try {
    if (!/^[0-9]{10}$/.test(code)) return;
    const stored = localStorage.getItem("hanu_registered_mssvs");
    const list: string[] = stored ? JSON.parse(stored) : [];
    const updated = [code, ...list.filter((x) => x !== code)].slice(0, 5);
    localStorage.setItem("hanu_registered_mssvs", JSON.stringify(updated));
  } catch {}
}

export function LoginForm({ next, resetDone }: { next: string; resetDone: boolean }) {
  const [state, action] = useActionState(loginAction, initialState);
  const [studentCode, setStudentCode] = useState("");
  const [knownMssvs, setKnownMssvs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hanu_registered_mssvs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((item): item is string => typeof item === "string" && /^[0-9]{10}$/.test(item));
          if (valid.length > 0) {
            queueMicrotask(() => setKnownMssvs(valid));
          }
        }
      }
    } catch {}
  }, []);

  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Chào mừng trở lại</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Dùng mã sinh viên để mở cuốn sổ ăn uống của bạn.</p>
      {resetDone && <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.</p>}
      <form
        action={action}
        onSubmit={(e) => {
          const code = (e.currentTarget.elements.namedItem("student_code") as HTMLInputElement)?.value?.trim();
          if (code) saveRegisteredMssv(code);
        }}
        className="mt-7 space-y-5"
      >
        <input type="hidden" name="next" value={next} />
        <div>
          <label className={labelClass}>Mã sinh viên (MSSV)
            <input
              name="student_code"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              list="registered-mssv-list"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              title="MSSV gồm đúng 10 chữ số"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              className={inputClass}
              placeholder="Nhập mã sinh viên 10 chữ số"
            />
          </label>
          <datalist id="registered-mssv-list">
            {knownMssvs.map((code) => (
              <option key={code} value={code} label={`MSSV ${code}`} />
            ))}
          </datalist>
        </div>
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
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Tham gia Hanu Hungry bằng email và MSSV của bạn.</p>
      <form
        action={action}
        onSubmit={(e) => {
          const code = (e.currentTarget.elements.namedItem("student_code") as HTMLInputElement)?.value?.trim();
          if (code) saveRegisteredMssv(code);
        }}
        className="mt-7 space-y-5"
      >
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

function OtpVerificationForm({ email, onBack }: { email: string; onBack: () => void }) {
  const [state, action] = useActionState(verifyRecoveryOtpAction, initialState);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const char = cleaned[cleaned.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Nhập mã OTP</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">
        Mã xác nhận 6 số đã được gửi đến email <strong className="text-[#1f1b1a]">{email}</strong>. Vui lòng kiểm tra hộp thư (hoặc mục Spam).
      </p>
      <form action={action} className="mt-7 space-y-5">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={digits.join("")} />

        <div>
          <label className={`${labelClass} text-center mb-3`}>Nhập 6 chữ số mã OTP</label>
          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                autoFocus={idx === 0}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="h-12 w-11 sm:h-14 sm:w-13 rounded-xl border-2 border-[#d9cece] bg-white text-center font-mono text-2xl font-black text-[#1f1b1a] shadow-sm transition focus:border-[#c51f30] focus:ring-2 focus:ring-[#c51f30]/20 focus:outline-none"
              />
            ))}
          </div>
        </div>

        <FormMessage state={state} />
        <SubmitButton>Xác nhận OTP</SubmitButton>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-[#756561] hover:text-[#1f1b1a] hover:underline"
        >
          ← Nhập lại email / MSSV
        </button>
        <Link href="/login" className="font-bold text-[#b51b2c] hover:underline">
          Đăng nhập
        </Link>
      </div>
    </>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialState);
  const [step, setStep] = useState<"request" | "otp">("request");
  const [emailValue, setEmailValue] = useState("");
  const [studentCodeValue, setStudentCodeValue] = useState("");
  const studentCodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success" && state.data?.email) {
      setStep("otp");
    } else if (state.status === "error") {
      setStudentCodeValue("");
      studentCodeInputRef.current?.focus();
    }
  }, [state]);

  if (step === "otp" && state.data?.email) {
    return <OtpVerificationForm email={state.data.email} onBack={() => setStep("request")} />;
  }

  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Quên mật khẩu</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Nhập email và MSSV thuộc tài khoản của bạn để nhận mã OTP đặt lại mật khẩu.</p>
      <form action={action} className="mt-7 space-y-5">
        <label className={labelClass}>Email
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="tenban@email.com"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
        </label>
        <label className={labelClass}>MSSV
          <input
            ref={studentCodeInputRef}
            name="student_code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            title="MSSV gồm đúng 10 chữ số"
            required
            className={inputClass}
            placeholder="10 chữ số"
            value={studentCodeValue}
            onChange={(e) => setStudentCodeValue(e.target.value)}
          />
        </label>
        <FormMessage state={state} />
        <SubmitButton>Gửi mã OTP</SubmitButton>
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
