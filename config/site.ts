export const siteConfig = {
  name: "Hanu Hungry",
  url: "https://hanuhungry.id.vn",
  description:
    "Khám phá 50+ quán ăn ngon, rẻ quanh khu vực Đại học Hà Nội (HANU). Xem menu, bảng giá, review chân thực và vòng quay Gacha chọn món trưa nay chỉ trong 3 giây!",
  tagline: "Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều.",
  navigation: [
    { href: "/", label: "Trang chủ", icon: "🏠" },
    { href: "/restaurants", label: "Khám phá", icon: "🔍" },
    { href: "/gacha", label: "Gacha", icon: "🎲" },
    { href: "/blog", label: "Blog", icon: "📝" },
  ],
  contact: {
    email: "hanuhungry@gmail.com",
    facebook: "",
  },
} as const;
