import { NextRequest } from "next/server";
import { uploadController } from "@/controller/upload.controller";

export async function POST(request: NextRequest) {
  return uploadController.create(request);
}

export async function DELETE(request: NextRequest) {
  return uploadController.remove(request);
}
