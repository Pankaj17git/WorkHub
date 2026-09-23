import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/services/upload.service";
import { authMiddleware } from "@/middleware/auth.middleware";
import { status } from "@/constants/statusCodes";

export const uploadController = {
  /**
   * @swagger
   * /api/uploads:
   *   post:
   *     tags: [Uploads]
   *     summary: Upload a file
   *     description: Uploads a file to Cloudinary storage.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [file]
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UploadFileResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async create(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: status.BAD_REQUEST });
    }

    const record = await uploadService.uploadFileOnCloudinary(file, BigInt(userId));
    return NextResponse.json(
      {
        ...record,
        id: record.id.toString(),
        userId: record.userId.toString(),
      }, { status: status.CREATED });
  },

  /**
   * @swagger
   * /api/uploads:
   *   delete:
   *     tags: [Uploads]
   *     summary: Delete a file
   *     description: Deletes a file using its storage key.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/DeleteFileRequest'
   *     responses:
   *       200:
   *         description: File deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteFileResponse'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async remove(req: NextRequest) {
    const { key } = await req.json();
    const userId = authMiddleware(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
    }
    await uploadService.deleteFileOnCloudinary(key);
    return NextResponse.json({ success: true });
  },
};