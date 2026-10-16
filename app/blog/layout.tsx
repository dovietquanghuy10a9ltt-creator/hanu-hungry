import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | Blog Hanu Hungry",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-serif text-[#28201e]"
      style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
    >
      {children}
    </div>
  );
}

