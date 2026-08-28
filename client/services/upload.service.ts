import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateFile } from "@/middleware/validateUpload.middleware";
import { prisma } from "@/lib/prisma";

const BUCKET = process.env.SUPABASE_BUCKET || "uploads";

export const uploadService = {
  async uploadFile(file: File, userId: bigint) {
    validateFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Sanitize filename
    const sanitizedFileName = file.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const key = `${randomUUID()}-${sanitizedFileName}`;

    const { error } = await getSupabaseAdmin().storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: publicUrlData } = getSupabaseAdmin().storage
      .from(BUCKET)
      .getPublicUrl(key);

    try {
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
    } catch (dbError) {
      // Roll back the orphaned storage object if the DB write fails.
      await getSupabaseAdmin()
        .storage.from(BUCKET)
        .remove([key])
        .catch((cleanupErr) =>
          console.error("Failed to clean up orphaned upload after DB error:", cleanupErr)
        );
      throw dbError;
    }
  },

  async deleteFile(url: string) {
    const key = url.split("/uploads/")[1];
    await getSupabaseAdmin().storage.from(BUCKET).remove([key]);
    await prisma.upload.delete({ where: { key } });
  },
};
