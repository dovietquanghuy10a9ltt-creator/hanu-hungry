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
  resendRecoveryOtpAction,
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

function getPasswordStrength(password: string): {
  label: string;
  colorClass: string;
  widthPercent: number;
  textColor: string;
} {
  if (!password) {
    return { label: "", colorClass: "bg-transparent", widthPercent: 0, textColor: "" };
  }

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (len < 6) {
    return { label: "Rất yếu", colorClass: "bg-red-500", widthPercent: 20, textColor: "#ef4444" };
  }

  if (len < 8) {
    return { label: "Yếu", colorClass: "bg-orange-500", widthPercent: 38, textColor: "#f97316" };
  }

  if (varietyCount <= 1) {
    return { label: "Yếu", colorClass: "bg-orange-500", widthPercent: 40, textColor: "#f97316" };
  }

  if (varietyCount === 2) {
    return { label: "Trung bình", colorClass: "bg-amber-400", widthPercent: 60, textColor: "#d97706" };
  }

  if (varietyCount === 3) {
    if (hasSpecial || len >= 10) {
      return { label: "Mạnh", colorClass: "bg-emerald-500", widthPercent: 82, textColor: "#059669" };
    }
    return { label: "Trung bình", colorClass: "bg-amber-400", widthPercent: 65, textColor: "#d97706" };
  }

  if (len >= 8) {
    return { label: "Rất mạnh", colorClass: "bg-teal-600", widthPercent: 100, textColor: "#0d9488" };
  }

  return { label: "Mạnh", colorClass: "bg-emerald-500", widthPercent: 85, textColor: "#059669" };
}

function PasswordField({
  name,
  label,
  autoComplete = "new-password",
  minLength,
  showStrength = false,
}: {
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [val, setVal] = useState("");

  const strength = showStrength ? getPasswordStrength(val) : null;

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
          value={val}
          onChange={(e) => setVal(e.target.value)}
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
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
              <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
              <path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 2.898-4.254" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          )}
        </button>
      </span>

      {strength && strength.label && (
        <span className="mt-2 block space-y-1 transition-all">
          <span className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-muted)] font-normal">Độ mạnh mật khẩu:</span>
            <span className="font-bold transition-colors duration-200" style={{ color: strength.textColor }}>
              {strength.label}
            </span>
          </span>
          <span className="block h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <span
              className={`block h-full ${strength.colorClass} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${strength.widthPercent}%` }}
            />
          </span>
        </span>
      )}
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
        {/* Anti-bot Honeypot Trap: người thật không nhìn thấy, bot cào form tự động điền sẽ bị phát hiện */}
        <div aria-hidden="true" style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}>
          <label htmlFor="user_phone_hp">Số điện thoại phụ</label>
          <input
            id="user_phone_hp"
            name="user_phone_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        <label className={labelClass}>MSSV
          <input name="student_code" type="text" inputMode="numeric" pattern="[0-9]{10}" minLength={10} maxLength={10} title="MSSV gồm đúng 10 chữ số" autoComplete="off" required className={inputClass} placeholder="10 chữ số" />
        </label>
        <label className={labelClass}>Email
          <input name="email" type="email" inputMode="email" autoComplete="email" required className={inputClass} placeholder="tenban@email.com" />
        </label>
        <PasswordField name="password" label="Mật khẩu" minLength={8} showStrength />
        <PasswordField name="confirm_password" label="Nhập lại mật khẩu" minLength={8} />
        <p className="text-xs text-[#756561]">Mật khẩu cần ít nhất 8 ký tự. Tên hiển thị mặc định lấy từ phần trước @ trong email.</p>
        <label className="flex items-start gap-2.5 text-xs text-[#5c4d49] cursor-pointer select-none rounded-xl border border-[#decbb8]/60 bg-[#fffcf5] p-3 transition hover:border-[#b51b2c]/40">
          <input
            name="accept_terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-[#decbb8] text-[#b51b2c] focus:ring-[#b51b2c] cursor-pointer shrink-0"
          />
          <span className="leading-relaxed">
            Tôi đã đọc và đồng ý với{" "}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-[#b51b2c] underline hover:text-[#8b1522]">
              Điều khoản dịch vụ
            </Link>{" "}
            và{" "}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#b51b2c] underline hover:text-[#8b1522]">
              Chính sách bảo mật
            </Link>{" "}
            của Hanu Hungry.
          </span>
        </label>
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
  const [countdown, setCountdown] = useState<number>(60);
  const [resendStatus, setResendStatus] = useState<AuthActionState | null>(null);
  const [isResending, setIsResending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenOtpRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const triggerAutoSubmit = (fullOtp: string) => {
    if (fullOtp.length === 6) {
      if (hiddenOtpRef.current) hiddenOtpRef.current.value = fullOtp;
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
    }
  };

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
    } else if (index === 5) {
      triggerAutoSubmit(next.join(""));
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
    if (pasted.length === 6) {
      triggerAutoSubmit(pasted);
    } else {
      const targetIdx = Math.min(pasted.length, 5);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendRecoveryOtpAction(email);
      setResendStatus(res);
      if (res.status === "success") {
        setCountdown(60);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setResendStatus({ status: "error", message: "Có lỗi khi gửi lại mã OTP." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Nhập mã OTP</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">
        Mã xác nhận 6 số đã được gửi đến email <strong className="text-[#1f1b1a]">{email}</strong>.
      </p>
      <p className="mt-1 text-xs text-[#b51b2c] font-medium">Mã có hiệu lực trong 5 phút.</p>

      <form ref={formRef} action={action} className="mt-6 space-y-5">
        <input type="hidden" name="email" value={email} />
        <input ref={hiddenOtpRef} type="hidden" name="otp" value={digits.join("")} />

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

        <div className="flex items-center justify-center text-sm pt-1">
          {countdown > 0 ? (
            <span className="text-[#756561]">
              Gửi lại mã sau <strong className="font-mono text-[#b51b2c]">{countdown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-[#b51b2c] hover:underline disabled:opacity-50 cursor-pointer"
            >
              {isResending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>
          )}
        </div>

        {resendStatus && (
          <p
            role={resendStatus.status === "error" ? "alert" : "status"}
            className={`rounded-xl px-4 py-2.5 text-center text-xs leading-relaxed ${resendStatus.status === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
          >
            {resendStatus.message}
          </p>
        )}

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
  const [returnToRequest, setReturnToRequest] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [studentCodeValue, setStudentCodeValue] = useState("");
  const studentCodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      studentCodeInputRef.current?.focus();
    }
  }, [state.status]);

  const isOtp = state.status === "success" && Boolean(state.data?.email) && !returnToRequest;

  if (isOtp && state.data?.email) {
    return <OtpVerificationForm email={state.data.email} onBack={() => setReturnToRequest(true)} />;
  }

  return (
    <>
      <h2 className="text-2xl font-black sm:text-3xl">Quên mật khẩu</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#756561]">Nhập email và MSSV thuộc tài khoản của bạn để nhận mã OTP đặt lại mật khẩu.</p>
      <form action={action} onSubmit={() => setReturnToRequest(false)} className="mt-7 space-y-5">
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
        <PasswordField name="password" label="Mật khẩu mới" minLength={8} showStrength />
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
        <PasswordField name="password" label="Mật khẩu mới" minLength={8} showStrength />
        <PasswordField name="confirm_password" label="Nhập lại mật khẩu mới" minLength={8} />
        <FormMessage state={state} />
        <SubmitButton>Đổi mật khẩu</SubmitButton>
      </form>
    </>
  );
}
