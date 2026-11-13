import Image from "next/image";

export function MaintenanceScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf7ef] px-4 py-12 text-[var(--color-ink)] selection:bg-[var(--color-red)] selection:text-white">
      <div className="w-full max-w-lg rounded-3xl border-2 border-[#4A3525] bg-white p-7 sm:p-10 text-center shadow-[0_8px_0_0_#4A3525,0_16px_32px_rgba(74,53,37,0.1)]">
        {/* Logo & Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#4A3525] bg-[#fff8eb] shadow-[0_4px_0_0_#4A3525]">
          <Image
            src="/brand/logo.png"
            alt="Hanu Hungry Logo"
            width={52}
            height={52}
            className="h-13 w-13 object-contain"
            priority
          />
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4A3525] bg-[#ffe7be] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#7a4805]">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b] animate-ping" />
          Hạ tầng đang nâng cấp
        </div>

        {/* Heading */}
        <h1 className="mb-3 font-heading text-2xl font-black leading-tight sm:text-3xl text-[var(--color-ink)]">
          Hanu Hungry sẽ sớm quay trở lại!
        </h1>

        {/* Description */}
        <p className="mb-6 text-sm sm:text-base leading-relaxed text-[var(--color-muted)]">
          Để mang lại trải nghiệm mượt mà và ổn định nhất cho các bạn sinh viên HANU, hệ thống đang tạm dừng phục vụ để nâng cấp và tối ưu hóa hạ tầng máy chủ.
        </p>

        {/* Info Box */}
        <div className="mb-6 rounded-2xl border border-[var(--color-line)] bg-[#faf7ef] p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-[var(--color-ink)]">Dự kiến mở lại:</span>
            <span className="font-extrabold text-[var(--color-red)]">Thứ Tư, 18/11/2026</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-[var(--color-ink)]">Thời gian còn lại:</span>
            <span className="text-[var(--color-muted)] font-medium">Khoảng 5 ngày</span>
          </div>
        </div>

        {/* Friendly Sign-off */}
        <p className="text-xs text-[var(--color-muted)] italic">
          Cảm ơn sự kiên nhẫn của bạn. Hẹn sớm gặp lại bạn quanh những bữa ăn ngon cùng Hanu Hungry!
        </p>

        <div className="mt-6 border-t border-[var(--color-line)] pt-4 text-xs font-bold text-[var(--color-muted)]">
          Đội ngũ Macaron · Đại học Hà Nội (HANU)
        </div>
      </div>
    </main>
  );
}
