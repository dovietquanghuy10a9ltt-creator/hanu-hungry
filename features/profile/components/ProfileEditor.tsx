"use client";

import { useState, useRef } from "react";
import { updateProfile } from "@/features/profile/actions";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_MESSAGE = "Chỉ có các định dạng ảnh sau được chấp nhận: JPG, JPEG, PNG, WEBP, GIF.";

interface ProfileEditorProps {
  displayName: string;
  avatarUrl: string | null;
  email?: string | null;
  studentCode: string;
}

export function ProfileEditor({
  displayName,
  avatarUrl,
  email,
  studentCode,
}: ProfileEditorProps) {
  const [name, setName] = useState(displayName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.type.toLowerCase();

    const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);
    const isMimeValid = ALLOWED_MIME_TYPES.includes(mimeType);

    if (!isExtensionValid || !isMimeValid) {
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormatError(`Định dạng file không hợp lệ. ${ALLOWED_MESSAGE}`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormatError("Kích thước file ảnh không được vượt quá 5MB.");
      return;
    }

    // Valid file
    setFormatError(null);
    setRemoveAvatar(false);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveAvatar = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewUrl(null);
    setRemoveAvatar(true);
    setFormatError(null);
  };

  return (
    <div className="card grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_1.3fr]">
      {/* Left side: Current Profile Info & Avatar Preview */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
        <div className="relative group">
          <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-line)] bg-[var(--color-pale)] shadow-inner">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Ảnh đại diện"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl text-[var(--color-red)] select-none">☺</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-red)] text-white shadow-md hover:bg-[var(--color-red-deep)] transition"
            title="Đổi ảnh đại diện"
            aria-label="Tải lên ảnh đại diện"
          >
            📷
          </button>
        </div>

        <div className="space-y-1 w-full">
          <h2 className="break-words text-2xl font-black">{name || "Chưa đặt tên"}</h2>
          {email && <p className="break-all text-sm text-[var(--color-muted)]">{email}</p>}
          <p className="text-sm text-[var(--color-muted)]">
            MSSV: <strong className="font-mono text-[var(--color-ink)]">{studentCode}</strong>
          </p>
          <p className="text-xs text-[var(--color-muted)] pt-1">
            MSSV và email dùng để xác thực tài khoản đăng nhập.
          </p>
        </div>
      </div>

      {/* Right side: Edit form */}
      <div>
        <form
          action={async (formData) => {
            setIsSubmitting(true);
            setFormatError(null);
            try {
              if (removeAvatar) {
                formData.set("removeAvatar", "1");
              }
              await updateProfile(formData);
            } catch (err: unknown) {
              setFormatError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu thông tin.");
              setIsSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          {formatError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
            >
              <div className="flex items-start gap-2">
                <span className="text-base font-bold text-red-600">⚠️</span>
                <div>
                  <p className="font-bold">Không thể tải ảnh:</p>
                  <p className="mt-0.5">{formatError}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[var(--color-ink)]">
              Tên hiển thị
              <input
                name="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={1}
                maxLength={100}
                required
                className="field mt-1.5"
                placeholder="Nhập tên hiển thị của bạn"
              />
            </label>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Đổi tên hiển thị không ảnh hưởng đến MSSV đăng nhập.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--color-ink)]">
              Ảnh đại diện
              <span className="block mt-1 text-xs font-normal text-[var(--color-muted)]">
                Chấp nhận file: <strong>JPG, JPEG, PNG, WEBP, GIF</strong> (tối đa 5MB)
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              name="avatar"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="mt-2 block w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-pale)] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[var(--color-red)] hover:file:bg-[#ebdccc] cursor-pointer"
            />
          </div>

          {previewUrl && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                ✕ Xóa ảnh đại diện hiện tại
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="button button-primary w-full sm:w-auto"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thông tin cá nhân"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
