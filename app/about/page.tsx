import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Về HANU Hungry" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8"><div className="brand-gradient rounded-[1.75rem] px-6 py-12 text-white sm:px-10"><p className="text-xs font-bold tracking-widest">VỀ CHÚNG MÌNH</p><h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">HANU Hungry</h1><p className="mt-4 max-w-2xl text-sm leading-7 sm:text-base">Một nơi để sinh viên Đại học Hà Nội tìm quán và món ăn quanh trường dựa trên dữ liệu nhóm tự khảo sát.</p></div><div className="grid gap-4 md:grid-cols-2"><section className="card p-6"><h2 className="text-xl font-extrabold">Dữ liệu thật</h2><p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">Thông tin quán và thực đơn được nhập từ bảng khảo sát. Khi dữ liệu còn thiếu, chúng mình hiển thị rõ là đang cập nhật thay vì tự đoán.</p></section><section className="card p-6"><h2 className="text-xl font-extrabold">Chọn món dễ hơn</h2><p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">Tìm theo món, loại quán, mức giá; hoặc để Gacha gợi ý. Bạn có thể lưu lần đã ăn và chia sẻ nhận xét về quán.</p></section></div><div className="flex flex-wrap gap-3"><Link href="/restaurants" className="button button-primary">Khám phá quán</Link><Link href="/contact" className="button button-secondary">Liên hệ nhóm</Link></div></div>
  );
}
