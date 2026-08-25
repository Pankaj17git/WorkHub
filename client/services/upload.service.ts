import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { validateFile } from "@/middleware/validateUpload.middleware";

const BUCKET = process.env.SUPABASE_BUCKET!;

export const uploadService = {
  async uploadFile(file: File) {
    validateFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${randomUUID()}-${file.name}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    // For a public bucket:
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(key);

    const record = await prisma.upload.create({
      data: {
        key,
        url: publicUrlData.publicUrl,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    return record;
  },

  async deleteFile(key: string) {
    await supabaseAdmin.storage.from(BUCKET).remove([key]);
    await prisma.upload.delete({ where: { key } });
  },
};