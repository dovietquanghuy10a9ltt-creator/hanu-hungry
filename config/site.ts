export const siteConfig = {
  name: "HANU Hungry",
  description: "Khám phá quán ăn quanh Đại học Hà Nội từ dữ liệu khảo sát thực tế.",
  tagline: "Ăn ngon quanh HANU, khỏi lo nghĩ nhiều.",
  navigation: [
    { href: "/", label: "Trang chủ", icon: "⌂" },
    { href: "/restaurants", label: "Khám phá", icon: "⌕" },
    { href: "/gacha", label: "Gacha", icon: "✦" },
    { href: "/blog", label: "Blog", icon: "▤" },
  ],
  contact: {
    email: "",
    facebook: "",
  },
} as const;
