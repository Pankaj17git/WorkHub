import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { status } from "@/constants/statusCodes";
import { authMiddleware } from "@/middleware/auth.middleware";
import { uploadService } from "@/services/upload.service";
import { extractKeyFromUrl, generateKey } from "@/utils/file.upload";
import { validateFile } from "@/middleware/validateUpload.middleware";


export const userController = {
  /**
   * @swagger
   * /api/user/update-profile:
   *   patch:
   *     tags: [User]
   *     summary: Update user profile image
   *     description: Uploads a new profile image for the authenticated user.
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [profileImage]
   *             properties:
   *               profileImage:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UpdateProfileResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async updateProfile(req: NextRequest) {
    try {
      const userId = authMiddleware(req);

      if (userId === null) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: status.UNAUTHORIZED }
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: status.NOT_FOUND });
      }

      const formData = await req.formData();
      const file = formData.get("profileImage") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: status.BAD_REQUEST });
      }

      validateFile(file);

      const key = generateKey();

      const buffer = Buffer.from(await file.arrayBuffer());

      const record = await uploadService.uploadToCloudinary(buffer, {
        public_id: key,
        folder: `users/profile`,
      });

      if (!record) {
        return NextResponse.json({ error: "File upload failed" }, { status: status.INTERNAL_SERVER_ERROR });
      }

      let user;
      try {
        const updatedUser = await prisma.user.update({
          where: { id: BigInt(userId) },
          data: { profileImage: record.url },
          select: { id: true, profileImage: true /* ...whatever's safe to return */ },
        });

        user = {
          ...updatedUser,
          id: updatedUser.id.toString(), // BigInt -> string for JSON safety
        };
      } catch (dbError) {
        // roll back the orphaned upload
        const key = extractKeyFromUrl(record.url);
        await uploadService.deleteFileOnCloudinary(`users/profile/${key}`).catch(() => {
          console.log("Failed to delete orphaned upload");
        });
        throw dbError;
      }

      // only delete the old image once the new one is confirmed saved
      const prevImage = existingUser.profileImage;
      if (prevImage) {
        const key = extractKeyFromUrl(prevImage);
        uploadService.deleteFileOnCloudinary(`users/profile/${key}`).catch((err) => {
          console.error("Failed to delete previous profile image:", err);
        });
      }

      return NextResponse.json({ user }, { status: status.OK });
    } catch (error: unknown) {
      console.error("Profile update failed:", error);
      return NextResponse.json(
        { error: "Profile update failed" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  }
}