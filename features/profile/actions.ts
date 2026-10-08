"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALLOWED_FORMATS_TEXT,
  ALLOWED_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  detectImageFormat,
} from "@/features/profile/validation";

const AVATAR_BUCKET = "avatars";

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

async function ensureAvatarsBucket(admin: ReturnType<typeof createAdminClient>) {
  try {
    const { data: bucket } = await admin.storage.getBucket(AVATAR_BUCKET);
    if (!bucket) {
      await admin.storage.createBucket(AVATAR_BUCKET, {
        public: true,
        fileSizeLimit: MAX_AVATAR_SIZE_BYTES,
        allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
      });
    }
  } catch {
    await admin.storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: MAX_AVATAR_SIZE_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    }).catch(() => {});
  }
}

async function cleanupUserAvatars(admin: ReturnType<typeof createAdminClient>, userId: string) {
  try {
    const { data: files } = await admin.storage.from(AVATAR_BUCKET).list(userId);
    if (files && files.length > 0) {
      await admin.storage.from(AVATAR_BUCKET).remove(files.map((file) => `${userId}/${file.name}`));
    }
  } catch {
    // Non-critical cleanup failure, ignore
  }
}

export async function updateProfile(formData: FormData) {
  const displayName = String(formData.get("displayName") || "").trim();
  if (!displayName || displayName.length > 100) {
    throw new Error("Tên hiển thị cần từ 1 đến 100 ký tự.");
  }

  const { user } = await requireUser();
  const supabase = await createClient();

  const removeAvatar = formData.get("removeAvatar") === "1";
  const avatarFile = formData.get("avatar") as File | null;

  const updatePayload: { display_name: string; avatar_url?: string | null } = {
    display_name: displayName,
  };

  if (removeAvatar) {
    updatePayload.avatar_url = null;
    try {
      const admin = createAdminClient();
      await cleanupUserAvatars(admin, user.id);
    } catch {
      // Non-critical cleanup failure
    }
  } else if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
    const mimeType = avatarFile.type.toLowerCase();
    const extension = avatarFile.name.split(".").pop()?.toLowerCase();
    const validExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "");

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !validExtension) {
      throw new Error(`Định dạng file không hợp lệ. Chỉ có các định dạng ảnh sau được chấp nhận: ${ALLOWED_FORMATS_TEXT}.`);
    }

    if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
      throw new Error("Kích thước file ảnh không được vượt quá 5MB.");
    }

    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detected = detectImageFormat(buffer);

    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      throw new Error("Nội dung file không phải là định dạng ảnh hợp lệ (JPG, PNG, WEBP, GIF).");
    }

    const admin = createAdminClient();
    await ensureAvatarsBucket(admin);
    await cleanupUserAvatars(admin, user.id);

    const filePath = `${user.id}/avatar-${Date.now()}.${detected.ext}`;
    const { error: uploadError } = await admin.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, buffer, {
        contentType: detected.mime,
        upsert: true,
      });

    if (uploadError) {
      console.error("[profile] Storage upload error:", uploadError.message);
      throw new Error("Không thể tải ảnh đại diện lên bộ lưu trữ. Vui lòng thử lại sau.");
    }

    const { data: { publicUrl } } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    updatePayload.avatar_url = publicUrl;
  }

  const { error } = await supabase.from("profiles").update(updatePayload).eq("id", user.id);
  if (error) {
    throw new Error("Không thể lưu thông tin hồ sơ. Vui lòng thử lại.");
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  redirect("/profile?updated=1");
}

export async function updateDisplayName(formData: FormData) {
  return updateProfile(formData);
}
