import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { signToken } from "../../auth";
import { z } from "zod";

const verifyOtpSchema = z
  .object({
    userId: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  })
  .refine((data) => data.userId || data.email || data.phone, {
    message: "Either userId, email, or phone must be provided",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { userId: inputUserId, email, phone, otp } = result.data;

    let targetUser: any = null;

    if (email) {
      targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else if (phone) {
      targetUser = await prisma.user.findFirst({ where: { phone: phone.trim() } });
    } else if (inputUserId) {
      targetUser = await prisma.user.findUnique({ where: { id: BigInt(inputUserId) } });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const verification = await verifyOtp({ userId: targetUser.id, otp });

    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    // Generate JWT token for session
    let token = "";
    try {
      token = signToken({
        userId: targetUser.id.toString(),
        email: targetUser.email,
        role: targetUser.role,
      });
    } catch {
      // JWT secret missing in env fallback
    }

    return NextResponse.json({
      message: verification.message,
      verified: true,
      token,
      user: {
        id: targetUser.id.toString(),
        email: targetUser.email,
        name: targetUser.name,
        phone: targetUser.phone,
        role: targetUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}
