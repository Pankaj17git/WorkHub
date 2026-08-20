import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { z } from "zod";

const sendOtpSchema = z
  .object({
    userId: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email must be provided",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid parameters" },
        { status: 400 }
      );
    }

    const { userId: inputUserId, email } = result.data;

    // Find user by email or userId
    let user;
    if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else if (inputUserId) {
      user = await prisma.user.findUnique({ where: { id: BigInt(inputUserId) } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate and store OTP in `otps` table
    const { plainOtp, otpRecord } = await createOtp({ userId: user.id });

    // Send email dispatch if user has an email
    const emailResult = await sendOtpEmail(user.email, plainOtp);

    return NextResponse.json({
      message: "OTP generated successfully",
      otpId: otpRecord.id.toString(),
      expiresAt: otpRecord.expiresAt,
      emailSent: emailResult.sent,
      emailNotice: emailResult.reason || undefined,
      // Provided in response for easy testing/development
      otp: plainOtp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
