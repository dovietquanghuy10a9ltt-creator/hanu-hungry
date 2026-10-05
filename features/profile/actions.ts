"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_FORMATS_TEXT = "JPG, JPEG, PNG, WEBP, GIF";

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

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
  } else if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
    const mimeType = avatarFile.type.toLowerCase();
    const extension = avatarFile.name.split(".").pop()?.toLowerCase();
    const validExtension = ["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "");

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !validExtension) {
      throw new Error(`Định dạng file không hợp lệ. Chỉ có các định dạng ảnh sau được chấp nhận: ${ALLOWED_FORMATS_TEXT}.`);
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      throw new Error("Kích thước file ảnh không được vượt quá 5MB.");
    }

    const arrayBuffer = await avatarFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    updatePayload.avatar_url = `data:${mimeType};base64,${base64}`;
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
