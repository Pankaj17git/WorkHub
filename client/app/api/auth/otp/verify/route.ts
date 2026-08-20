import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { z } from "zod";

const verifyOtpSchema = z
  .object({
    userId: z.string().optional(),
    email: z.string().email().optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email must be provided",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { userId: inputUserId, email, otp } = result.data;

    let targetUserId: bigint | undefined;

    if (email) {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      targetUserId = user.id;
    } else if (inputUserId) {
      targetUserId = BigInt(inputUserId);
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid user identifier" }, { status: 400 });
    }

    const verification = await verifyOtp({ userId: targetUserId, otp });

    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    return NextResponse.json({
      message: verification.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify OTP" }, { status: 500 });
  }
}
