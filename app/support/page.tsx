"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, Compass, Mail } from "lucide-react";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "data-source",
    category: "Khám phá quán ăn",
    question: "Dữ liệu quán ăn quanh HANU được thu thập từ đâu?",
    answer: "Toàn bộ dữ liệu quán ăn và menu món trên Hanu Hungry được thu thập và thẩm định từ cuộc khảo sát thực tế của sinh viên HANU. Các thông tin về giá cả, địa chỉ ngõ ngách và đánh giá đều phản ánh trải nghiệm chân thực nhất của các HANUers.",
  },
  {
    id: "search-filter",
    category: "Khám phá quán ăn",
    question: "Làm thế nào để tìm quán ăn theo mức giá và khoảng cách đi bộ?",
    answer: "Bạn truy cập vào mục 'Khám phá' trên thanh điều hướng. Tại đây có sẵn các bộ lọc thông minh: tìm theo mức giá (sinh viên tiết kiệm < 30k, trung bình 30k - 50k), khoảng cách (ngay cổng trường, bán kính 300m, 500m, 1km) và danh mục món (cơm, bún/phở, đồ ăn vặt, trà sữa/cà phê...).",
  },
  {
    id: "gacha-how",
    category: "Gacha & Giải trí",
    question: "Tính năng 'Gacha hôm nay ăn gì' hoạt động như thế nào?",
    answer: "Khi bạn hoặc nhóm bạn băn khoăn không biết ăn gì, hãy vào mục 'Gacha'. Hệ thống cho phép bạn tùy chỉnh khoảng giá, loại món rồi bấm 'Quay món'. Hệ thống sẽ ngẫu nhiên chọn ra món ăn chân ái cùng tên quán và chỉ đường chi tiết đến quán đó.",
  },
  {
    id: "streak-system",
    category: "Gacha & Giải trí",
    question: "Chuỗi điểm danh (Streak) được tính như thế nào?",
    answer: "Mỗi ngày bạn truy cập và khám phá món ăn trên Hanu Hungry, hệ thống sẽ tự động ghi nhận điểm danh +1 ngày vào chuỗi (Streak) hiển thị ở góc trên màn hình. Duy trì chuỗi liên tục giúp bạn tích lũy thành tích và không bỏ lỡ các món ngon mỗi ngày.",
  },
  {
    id: "forgot-password",
    category: "Tài khoản sinh viên",
    question: "Tôi bị quên mật khẩu thì lấy lại bằng cách nào?",
    answer: "Bạn chỉ cần vào trang Đăng nhập -> bấm 'Quên mật khẩu'. Nhập đúng Email và MSSV của bạn, hệ thống sẽ gửi mã OTP gồm 6 chữ số về email. Bạn nhập mã OTP vào web là có thể đặt ngay mật khẩu mới chỉ trong vòng 1 phút.",
  },
  {
    id: "avatar-change",
    category: "Tài khoản sinh viên",
    question: "Làm sao để đổi ảnh đại diện và xem ảnh đại diện của mình?",
    answer: "Bạn bấm vào mục 'Cá nhân' (hoặc icon ảnh đại diện góc trên). Tại trang Thông tin cá nhân, bạn chỉ cần bấm trực tiếp vào hình tròn ảnh đại diện: một bảng tùy chọn sẽ hiện lên cho phép bạn chọn 'Xem ảnh đại diện' ở chế độ phóng to toàn màn hình hoặc 'Chọn ảnh trên máy' để tải ảnh mới lên.",
  },
  {
    id: "submit-restaurant",
    category: "Đóng góp & Hỗ trợ",
    question: "Tôi muốn giới thiệu quán ăn ngon mới quanh trường thì làm sao?",
    answer: "Hanu Hungry luôn chào đón sự đóng góp của mọi người! Bạn có thể gửi thông tin quán (tên quán, địa chỉ, món ngon gợi ý) qua trang 'Liên hệ' hoặc nhắn tin trực tiếp cho ban quản trị qua Fanpage / Email để chúng mình cập nhật thêm vào bản đồ ẩm thực nhé.",
  },
  {
    id: "account-safety",
    category: "Đóng góp & Hỗ trợ",
    question: "Mật khẩu và thông tin tài khoản của tôi có an toàn không?",
    answer: "Mọi thông tin tài khoản đều được mã hóa và bảo mật nghiêm ngặt bằng cơ sở dữ liệu Supabase tiêu chuẩn quốc tế. Mật khẩu được mã hóa một chiều an toàn tuyệt đối và chỉ có chính bạn mới có thể đăng nhập hoặc đặt lại mật khẩu.",
  },
];

export default function SupportPage() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  const categories = ["Tất cả", "Khám phá quán ăn", "Gacha & Giải trí", "Tài khoản sinh viên", "Đóng góp & Hỗ trợ"];

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = selectedCategory === "Tất cả"
    ? FAQS
    : FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-pale)] px-4 py-1.5 text-xs font-bold text-[var(--color-red)] tracking-wide uppercase">
          <HelpCircle className="h-4.5 w-4.5 text-[var(--color-red)] shrink-0" />
          Trung tâm Trợ giúp HANUers
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-ink)] tracking-tight">
          Hỏi Đáp & Hỗ Trợ
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-muted)] max-w-xl mx-auto">
          Giải đáp nhanh các thắc mắc thường gặp về tìm quán, quay gacha, chuỗi điểm danh và tài khoản sinh viên.
        </p>
      </div>

      {/* Category Filter Dropdown */}
      <div className="max-w-xs sm:max-w-sm mx-auto mb-8">
        <label htmlFor="faqCategorySelect" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2 text-center">
          Chọn chủ đề hỏi đáp:
        </label>
        <div className="relative">
          <select
            id="faqCategorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none rounded-2xl border-2 border-[var(--color-line)] bg-white px-4 py-3 pr-10 text-sm font-bold text-[var(--color-ink)] shadow-xs transition hover:border-[var(--color-red)]/50 focus:border-[var(--color-red)] focus:ring-2 focus:ring-[var(--color-red)]/20 outline-hidden cursor-pointer text-center sm:text-left"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "Tất cả" ? "Tất cả chủ đề" : cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-red)] font-bold text-xs">
            ▼
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
          Đang hiển thị {filteredFaqs.length} câu hỏi thắc mắc
        </p>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3.5">
        {filteredFaqs.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div
              key={faq.id}
              className="card overflow-hidden transition-all duration-200 border border-[var(--color-line)]/70 hover:border-[var(--color-red)]/40 shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left font-bold text-base sm:text-lg text-[var(--color-ink)] hover:text-[var(--color-red)] transition"
                aria-expanded={isOpen}
              >
                <span className="flex items-start gap-2.5">
                  <span className="text-[var(--color-red)] font-mono text-sm sm:text-base mt-0.5">Q.</span>
                  <span>{faq.question}</span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-pale)] text-xs text-[var(--color-red)] font-bold transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[var(--color-red)] text-white" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--color-line)]/50 bg-[#faf7ef]/40 px-5 py-4 sm:px-6 sm:py-5 text-sm sm:text-[15px] leading-relaxed text-[#493c38]">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Footer Card */}
      <div className="mt-12 rounded-2xl border-2 border-dashed border-[var(--color-line)] bg-white p-6 sm:p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">Bạn vẫn cần thêm sự trợ giúp?</h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mx-auto">
          Nếu có câu hỏi khác hoặc gặp sự cố kỹ thuật trong quá trình sử dụng, đừng ngần ngại nhắn tin cho chúng mình!
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="button button-primary text-sm font-bold px-6 py-2.5 rounded-xl inline-flex items-center gap-2"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span>Gửi phản hồi / Liên hệ</span>
          </Link>
          <Link
            href="/restaurants"
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-pale)] px-5 py-2.5 text-sm font-bold text-[var(--color-ink)] hover:bg-[#eadbc9] transition inline-flex items-center gap-2"
          >
            <Compass className="h-4.5 w-4.5 text-[var(--color-red)] shrink-0" />
            <span>Khám phá quán ăn</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

