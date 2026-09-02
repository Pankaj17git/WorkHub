import { NextRequest } from "next/server";
import { userController } from "@/controller/user.controller";

export async function PATCH(request: NextRequest) {
  return userController.updateProfile(request);
}
