import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  detectImageFormat,
  ALLOWED_MIME_TYPES,
  ALLOWED_FORMATS_TEXT,
} from "@/features/profile/validation";

const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadAdminMedia(
  bucket: "restaurants" | "blog" | "dishes",
  file: File
): Promise<string> {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "");

  if (!ALLOWED_MIME_TYPES.has(mimeType) || !validExtension) {
    throw new Error(
      `Định dạng file không hợp lệ. Chỉ chấp nhận các định dạng: ${ALLOWED_FORMATS_TEXT}.`
    );
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    throw new Error("Kích thước file ảnh không được vượt quá 5MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detected = detectImageFormat(buffer);

  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new Error("Nội dung file không phải là ảnh hợp lệ (JPG, PNG, WEBP, GIF).");
  }

  const admin = createAdminClient();
  const filePath = `${Date.now()}-${randomUUID()}.${detected.ext}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: detected.mime,
      upsert: true,
    });

  if (uploadError) {
    console.error(`[admin-media] Upload to ${bucket} failed:`, uploadError.message);
    throw new Error("Không thể tải ảnh lên hệ thống lưu trữ. Vui lòng thử lại.");
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

