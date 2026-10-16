"use client";

import { useState, useRef } from "react";

type Props = {
  name?: string;
  urlFieldName?: string;
  removeFieldName?: string;
  title: string;
  defaultUrl?: string | null;
  description?: string;
};

export function ImageUploadField({
  name = "image",
  urlFieldName = "image_url",
  removeFieldName = "remove_image",
  title,
  defaultUrl = null,
  description = "Chấp nhận JPG, PNG, WEBP, GIF (Tối đa 5MB). Ảnh được tải lên lưu trữ an toàn.",
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultUrl);
  const [isRemoved, setIsRemoved] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setIsRemoved(false);
      setFileName(file.name);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsRemoved(true);
    setFileName(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#4d3c38]">
        {title}
      </label>

      {/* Hidden inputs to preserve existing URL or track removal */}
      <input
        type="hidden"
        name={urlFieldName}
        value={isRemoved ? "" : previewUrl && !previewUrl.startsWith("blob:") ? previewUrl : defaultUrl || ""}
      />
      <input type="hidden" name={removeFieldName} value={isRemoved ? "1" : "0"} />

      {/* Persistent file input in DOM so files are never unmounted or lost upon preview */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />

      {previewUrl && !isRemoved ? (
        <div className="relative overflow-hidden rounded-xl border border-[#e5d7d2] bg-[#faf7ef] p-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-[#d9c7c0] bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Xem trước ảnh"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-bold text-[#28201e]">
                {fileName ? `Đã chọn: ${fileName}` : "Ảnh hiện tại"}
              </p>
              <p className="text-xs text-[#76645d]">{description}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex cursor-pointer items-center rounded-lg border border-[#d9c7c0] bg-white px-3 py-1.5 text-xs font-bold text-[#5f3c38] transition hover:bg-[#fff3ee]"
                >
                  Đổi ảnh khác
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#bd2030] transition hover:bg-[#fde8ea]"
                >
                  Xóa ảnh
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#d9c7c0] bg-[#faf7ef] p-4 text-center">
          <p className="text-xs font-bold text-[#76645d]">{description}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2.5 inline-flex cursor-pointer items-center rounded-xl bg-[#bd2030] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a71928]"
          >
            Chọn ảnh từ máy
          </button>
          {isRemoved && (
            <p className="mt-2 text-xs font-medium text-amber-700">
              Ảnh sẽ bị xóa khi bạn lưu thay đổi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

