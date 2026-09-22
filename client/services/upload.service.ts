import { randomUUID } from "crypto";
import { validateFile } from "@/middleware/validateUpload.middleware";
import { prisma } from "@/lib/prisma";
import { cloudinaryClient } from "@/lib/cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";

export const uploadService = {


  async uploadToCloudinary(buffer: Buffer, options: UploadApiOptions) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinaryClient.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Cloudinary upload returned no result"));
        }
      });
      uploadStream.end(buffer);
    });
  },

  async uploadFileOnCloudinary(file: File, userId: bigint) {
    validateFile(file);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Sanitize filename
    const sanitizedFileName = file.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    const fileNameWithoutExtension = sanitizedFileName.replace(/\.[^/.]+$/, '');
    const key = `${randomUUID()}-${fileNameWithoutExtension}`;

    const uploadResult = await this.uploadToCloudinary(buffer, {
      public_id: key,
      folder: `users/${userId}`,
    })

    console.log("uploadResult", uploadResult.url);

    try {
      const record = await prisma.upload.create({
        data: {
          key: uploadResult.public_id,
          url: uploadResult.url,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          userId,
        },
      });
      return record;
    } catch (error) {
      // Roll back the orphaned storage object if the DB write fails.
      await cloudinaryClient.uploader.destroy(uploadResult.public_id, {
        resource_type: "image",
        invalidate: true,
      });

      throw error;
    }
  },

  async deleteFileOnCloudinary(key: string) {
    const result = await cloudinaryClient.uploader.destroy(key, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok") {
      console.error(`Cloudinary delete failed for key "${key}":`, result);
    }

    return result;
  },

};


