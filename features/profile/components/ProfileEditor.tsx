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
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
          <div
            onClick={() => setShowActionSheet(true)}
            className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-line)] bg-[var(--color-pale)] shadow-inner cursor-pointer hover:opacity-90 transition active:scale-95"
            title="Bấm để xem hoặc đổi ảnh đại diện"
          >
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
            onClick={() => setShowActionSheet(true)}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-red)] text-white shadow-md hover:bg-[var(--color-red-deep)] transition active:scale-90"
            title="Tùy chọn ảnh đại diện"
            aria-label="Tùy chọn ảnh đại diện"
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
              if (
                typeof err === "object" &&
                err !== null &&
                ((err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT") ||
                  (err as { message?: string }).message === "NEXT_REDIRECT")
              ) {
                throw err;
              }
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
                  <p className="font-bold">Lỗi:</p>
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

      {/* Zalo-style Action Sheet Modal */}
      {showActionSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-all"
          onClick={() => setShowActionSheet(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
            <h3 className="mb-2 text-base font-bold text-[#1e3a8a] px-2">Ảnh đại diện</h3>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowActionSheet(false);
                  setShowImageModal(true);
                }}
                className="flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left font-semibold text-[#1f1b1a] hover:bg-gray-100 transition active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-[15px]">Xem ảnh đại diện</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowActionSheet(false);
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left font-semibold text-[#1f1b1a] hover:bg-gray-100 transition active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-[15px]">Chọn ảnh trên máy</span>
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowActionSheet(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left font-semibold text-red-600 hover:bg-red-50 transition active:scale-[0.98]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 text-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </span>
                  <span className="text-[15px]">Xóa ảnh đại diện</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowActionSheet(false)}
              className="mt-3 w-full rounded-xl bg-gray-100 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Image Viewer Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all"
          onClick={() => setShowImageModal(false)}
        >
          <button
            type="button"
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 text-xl font-bold transition z-10"
            aria-label="Đóng xem ảnh"
          >
            ✕
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Ảnh đại diện chi tiết"
                className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl ring-4 ring-white/10"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-full bg-[var(--color-pale)] border-4 border-white/20 text-8xl text-[var(--color-red)] shadow-2xl">
                ☺
              </div>
            )}
          </div>
        </div>
      )}
      {/* Confirmation Modal for Avatar Deletion */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-all"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xóa ảnh đại diện?</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa ảnh đại diện không? Ảnh sẽ được gỡ bỏ và quay về biểu tượng mặc định.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleRemoveAvatar();
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
