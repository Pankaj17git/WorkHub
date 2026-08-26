import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateFile } from "@/middleware/validateUpload.middleware";
import { prisma } from "@/lib/prisma";

const BUCKET = process.env.SUPABASE_BUCKET!;

export const uploadService = {
  async uploadFile(file: File, userId: bigint) {
    validateFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${randomUUID()}-${file.name}`;

    const { error } = await getSupabaseAdmin().storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    // For a public bucket:
    const { data: publicUrlData } = getSupabaseAdmin().storage
      .from(BUCKET)
      .getPublicUrl(key);

    const record = await prisma.upload.create({
      data: {
        key,
        url: publicUrlData.publicUrl,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        userId,
      },
    });

    return record;
  },

  async deleteFile(key: string) {
    await getSupabaseAdmin().storage.from(BUCKET).remove([key]);
    await prisma.upload.delete({ where: { key } });
  },
};
