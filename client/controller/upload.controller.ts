import { NextRequest, NextResponse } from "next/server";
import { uploadService } from "@/services/upload.service";

export const uploadController = {
  async create(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const record = await uploadService.uploadFile(file);
    return NextResponse.json(record, { status: 201 });
  },

  async remove(req: NextRequest) {
    const { key } = await req.json();
    await uploadService.deleteFile(key);
    return NextResponse.json({ success: true });
  },
};