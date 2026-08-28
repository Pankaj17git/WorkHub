import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { status } from "@/constants/statusCodes";
import { authMiddleware } from "@/middleware/auth.middleware";
import { uploadService } from "@/services/upload.service";


export const userController = {

  async updateProfile(req: NextRequest) {
    try {
      const userId = await authMiddleware(req);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
      }

      const existingUser = await prisma.user.findUnique({ where: { id: userId.toString() } });
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: status.NOT_FOUND });
      }

      const formData = await req.formData();
      const file = formData.get("profileImage") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: status.BAD_REQUEST });
      }

      // TODO: validate file.type / file.size here before uploading

      const record = await uploadService.uploadFile(file, BigInt(userId));
      if (!record) {
        return NextResponse.json({ error: "File upload failed" }, { status: status.INTERNAL_SERVER_ERROR });
      }

      let user;
      try {
        let updatedUser = await prisma.user.update({
          where: { id: userId.toString() },
          data: { profileImage: record.url },
          select: { id: true, profileImage: true /* ...whatever's safe to return */ },
        });

        user = {
          ...updatedUser,
          id: updatedUser.id.toString(), // BigInt -> string for JSON safety
        };
      } catch (dbError) {
        // roll back the orphaned upload
        await uploadService.deleteFile(record.url).catch(() => {});
        throw dbError;
      }

      // only delete the old image once the new one is confirmed saved
      const prevImage = existingUser.profileImage;
      if (prevImage) {
        uploadService.deleteFile(prevImage).catch((err) => {
          console.error("Failed to delete previous profile image:", err);
        });
      }

      return NextResponse.json({ user }, { status: status.OK });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      return NextResponse.json(
        { error: "Profile update failed" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  }
}