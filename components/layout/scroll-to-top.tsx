"use client";

export function ScrollToTopButton() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex items-center gap-1 text-xs font-medium text-white/80 transition-all hover:text-white hover:underline focus:outline-hidden cursor-pointer"
      aria-label="Cuộn về đầu trang"
    >
      <span>Về đầu trang</span>
      <span aria-hidden="true" className="text-sm leading-none font-bold">↑</span>
    </button>
  );
}
