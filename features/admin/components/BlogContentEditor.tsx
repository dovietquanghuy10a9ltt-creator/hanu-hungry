"use client";

import { useState, useRef } from "react";
import { sanitizeBlogHtml } from "@/features/blog/sanitize";

type Props = {
  defaultValue?: string;
  name?: string;
  required?: boolean;
};

const TEXT_COLORS = [
  { label: "Đỏ", value: "#bd2030" },
  { label: "Xanh dương", value: "#1d4ed8" },
  { label: "Xanh lá", value: "#15803d" },
  { label: "Cam", value: "#c2410c" },
  { label: "Tím", value: "#7e22ce" },
  { label: "Đen", value: "#28201e" },
];

const BG_COLORS = [
  { label: "Vàng dạ quang", value: "#fef08a" },
  { label: "Xanh bơ nhạt", value: "#dcfce7" },
  { label: "Hồng phấn", value: "#fce7f3" },
  { label: "Xanh lam nhạt", value: "#e0f2fe" },
  { label: "Cam sữa", value: "#ffedd5" },
];

export function BlogContentEditor({
  defaultValue = "",
  name = "content",
  required = true,
}: Props) {
  const [content, setContent] = useState(defaultValue);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [customTextColor, setCustomTextColor] = useState("#bd2030");
  const [customBgColor, setCustomBgColor] = useState("#fef08a");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyWrap = (prefix: string, suffix: string, placeholder = "Nội dung") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newContent =
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);

    setContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const applyTextColor = (color: string) => {
    applyWrap(`<span style="color: ${color}">`, `</span>`, "Chữ đổi màu");
  };

  const applyBgColor = (bgColor: string) => {
    applyWrap(`<span style="background-color: ${bgColor}">`, `</span>`, "Chữ tô nền");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-[#4d3c38]">
          Nội dung bài viết
        </label>
        <div className="flex rounded-lg border border-[#d9c7c0] bg-[#faf7ef] p-0.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`rounded-md px-3 py-1 transition ${
              activeTab === "edit"
                ? "bg-[#bd2030] text-white shadow-sm"
                : "text-[#5f3c38] hover:bg-[#fff3ee]"
            }`}
          >
            ✏️ Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`rounded-md px-3 py-1 transition ${
              activeTab === "preview"
                ? "bg-[#bd2030] text-white shadow-sm"
                : "text-[#5f3c38] hover:bg-[#fff3ee]"
            }`}
          >
            👁️ Xem trước
          </button>
        </div>
      </div>

      {/* Hidden input to ensure form always submits latest content state */}
      <input type="hidden" name={name} value={content} />

      {/* Word-like formatting toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#e5d7d2] bg-[#fbf9f6] p-2 text-sm">
        {/* Bold */}
        <button
          type="button"
          onClick={() => applyWrap("<strong>", "</strong>", "In đậm")}
          title="In đậm (Bold)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9c7c0] bg-white font-bold text-[#28201e] hover:bg-[#fff3ee]"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => applyWrap("<em>", "</em>", "In nghiêng")}
          title="In nghiêng (Italic)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9c7c0] bg-white font-serif italic text-[#28201e] hover:bg-[#fff3ee]"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => applyWrap("<u>", "</u>", "Gạch chân")}
          title="Gạch chân (Underline)"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9c7c0] bg-white underline text-[#28201e] hover:bg-[#fff3ee]"
        >
          U
        </button>

        {/* Heading */}
        <button
          type="button"
          onClick={() => applyWrap("\n## ", "\n", "Tiêu đề mục")}
          title="Tiêu đề mục (H2)"
          className="flex h-8 items-center justify-center rounded-lg border border-[#d9c7c0] bg-white px-2 font-bold text-xs text-[#28201e] hover:bg-[#fff3ee]"
        >
          H2
        </button>

        <span className="mx-1 h-5 w-[1px] bg-[#d9c7c0]" />

        {/* Text color palette */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[#5f3c38] ml-1">Màu chữ:</span>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => applyTextColor(c.value)}
              title={c.label}
              className="h-6 w-6 rounded-md border border-neutral-300 transition hover:scale-110"
              style={{ backgroundColor: c.value }}
            />
          ))}
          <label
            title="Chọn màu chữ tùy biến"
            className="flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#d9c7c0] bg-white hover:bg-neutral-100"
          >
            🎨
            <input
              type="color"
              value={customTextColor}
              onChange={(e) => {
                setCustomTextColor(e.target.value);
                applyTextColor(e.target.value);
              }}
              className="sr-only"
            />
          </label>
        </div>

        <span className="mx-1 h-5 w-[1px] bg-[#d9c7c0]" />

        {/* Background color / highlight palette */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[#5f3c38] ml-1">Tô nền:</span>
          {BG_COLORS.map((bg) => (
            <button
              key={bg.value}
              type="button"
              onClick={() => applyBgColor(bg.value)}
              title={bg.label}
              className="h-6 w-6 rounded-md border border-neutral-300 transition hover:scale-110"
              style={{ backgroundColor: bg.value }}
            />
          ))}
          <label
            title="Chọn màu nền tùy biến"
            className="flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[#d9c7c0] bg-white hover:bg-neutral-100"
          >
            🖍️
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => {
                setCustomBgColor(e.target.value);
                applyBgColor(e.target.value);
              }}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {activeTab === "edit" ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          required={required}
          placeholder="Nhập nội dung bài viết... Bạn có thể chọn chữ và bấm các nút công cụ bên trên để in đậm, in nghiêng, gạch chân, tô màu chữ hoặc tô nền."
          className="mt-1.5 min-h-[320px] w-full rounded-xl border border-[#e5d7d2] bg-white p-3 font-serif text-base text-[#28201e] outline-none focus:border-[#c51f30] focus:ring-2 focus:ring-[#c51f30]/15"
          style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
        />
      ) : (
        <div
          className="min-h-[320px] rounded-xl border border-[#e5d7d2] bg-white p-6 font-serif text-[#28201e] space-y-4"
          style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}
        >
          {content ? (
            content.split(/\n\s*\n/).map((para, idx) => {
              const trimmed = para.trim();
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-xl font-bold text-[#bd2030] pt-2">
                    {trimmed.slice(3)}
                  </h2>
                );
              }
              return (
                <p
                  key={idx}
                  className="leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(trimmed) }}
                />
              );
            })
          ) : (
            <p className="italic text-neutral-400">Chưa có nội dung để xem trước.</p>
          )}
        </div>
      )}

      <p className="text-xs text-[#756561]">
        💡 <strong>Mẹo:</strong> Bôi đen phần văn bản và bấm các nút trên thanh công cụ để định dạng Word (in đậm, in nghiêng, gạch chân, tô màu chữ hoặc tô nền). Bấm <strong>👁️ Xem trước</strong> để duyệt ngay kết quả theo font Times New Roman.
      </p>
    </div>
  );
}

