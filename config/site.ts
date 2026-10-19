export const siteConfig = {
  name: "Hanu Hungry",
  url: "https://hanuhungry.id.vn",
  description:
    "Khám phá 50+ quán ăn ngon, rẻ quanh khu vực Đại học Hà Nội (HANU). Xem menu, bảng giá, review chân thực và vòng quay Gacha chọn món trưa nay chỉ trong 3 giây!",
  tagline: "Ăn ngon quanh Hanu, khỏi lo nghĩ nhiều.",
  navigation: [
    { href: "/", label: "Trang chủ", icon: "/icons/nav/home.png" },
    { href: "/restaurants", label: "Khám phá", icon: "/icons/nav/explore.png" },
    { href: "/gacha", label: "Gacha", icon: "/icons/nav/gacha.png" },
    { href: "/blog", label: "Blog", icon: "/icons/nav/blog.png" },
  ],
  contact: {
    email: "hanuhungry@gmail.com",
    facebook: "",
  },
} as const;
