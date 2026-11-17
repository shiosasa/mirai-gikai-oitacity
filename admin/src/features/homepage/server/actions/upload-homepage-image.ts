"use server";

import { randomUUID } from "node:crypto";
import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import {
  homepageImageLimit,
  validateHomepageImage,
} from "../../shared/utils/image-file";

export async function uploadHomepageImage(input: FormData) {
  await requireAdmin();
  try {
    const file = input.get("image");
    if (!(file instanceof File) || file.size > homepageImageLimit)
      throw new Error("5MB以下の画像ファイルを選んでください");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = validateHomepageImage(bytes, file.type);
    const storage = createAdminClient().storage.from("homepage-images");
    const path = `${randomUUID()}.${extension}`;
    const { error } = await storage.upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (error)
      throw new Error(`画像をアップロードできません: ${error.message}`);
    return { url: storage.getPublicUrl(path).data.publicUrl };
  } catch (error) {
    console.error("Upload homepage image error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "画像をアップロードできませんでした",
    };
  }
}
