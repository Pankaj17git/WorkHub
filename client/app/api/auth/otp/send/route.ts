import { authController } from "@/controller/auth.controller";

export async function POST(request: Request) {
  return authController.sendOtp(request);
}
