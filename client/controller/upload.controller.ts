import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/services/upload.service";
import { authMiddleware } from "@/middleware/auth.middleware";
import { status } from "@/constants/statusCodes";

export const uploadController = {
  async create(req: NextRequest) {
    const userId = await authMiddleware(req);
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

  async remove(req: NextRequest) {
    const { key } = await req.json();
    const userId = await authMiddleware(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
    }
    await uploadService.deleteFile(key);
    return NextResponse.json({ success: true });
  },
};