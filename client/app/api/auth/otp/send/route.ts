import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSms } from "@/lib/sms";
import { z } from "zod";
import { sendPhoneOtp, setupRecaptcha } from "@/lib/firebase";

const sendOtpSchema = z
  .object({
    userId: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    length: z.number().min(4).max(8).optional(),
    role: z.string().optional(),
    name: z.string().optional(),
  })
  .refine((data) => data.userId || data.email || data.phone, {
    message: "Either userId, email, or phone must be provided",
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

    const { userId: inputUserId, email, phone, length = 6, role, name } = result.data;

    // Find user by email, phone, or userId
    let user;
    if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else if (phone) {
      const cleanPhone = phone.trim();
      user = await prisma.user.findFirst({ where: { phone: cleanPhone } });

      if (!user) {
        // Auto-create user for phone-based signup/auth flow if user does not exist yet
        const cleanDigits = cleanPhone.replace(/\D/g, "");
        const tempEmail = `${cleanDigits.slice(-10)}@phone.workhub`;

        const existingByTempEmail = await prisma.user.findUnique({ where: { email: tempEmail } });
        if (existingByTempEmail) {
          user = existingByTempEmail;
        } else {
          user = await prisma.user.create({
            data: {
              phone: cleanPhone,
              email: tempEmail,
              name: name || "Phone User",
              password: "", // Password not required for OTP auth
              role: role || "CUSTOMER",
            },
          });
        }
      }
    } else if (inputUserId) {
      user = await prisma.user.findUnique({ where: { id: BigInt(inputUserId) } });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate and store OTP in `otps` table
    const { plainOtp, otpRecord } = await createOtp({ userId: user.id, length });

    /**
     * Otp through phone is yet to be implemented
     */

    // Target Phone dispatch
    // const targetPhone = phone || user.phone;
    // let smsResult;
    // if (targetPhone) {
    //   try {
    //     const appVerifier = setupRecaptcha("recaptcha-container");
    //     smsResult = await sendPhoneOtp(targetPhone, appVerifier);
    //   } catch (error) {
    //     console.error("Failed to send OTP to phone:", error);
    //     smsResult = { sent: false, reason: "Failed to send OTP to phone" };
    //   }
    // }

    // Target Email dispatch
    let emailResult: { sent: boolean; method: string; reason?: string } = { sent: false, method: "none" };
    if (user.email && !user.email.endsWith("@phone.workhub")) {
      emailResult = await sendOtpEmail(user.email, plainOtp);
    }

    return NextResponse.json({
      message: "OTP generated successfully",
      otpId: otpRecord.id.toString(),
      expiresAt: otpRecord.expiresAt,
      // smsSent: smsResult.sent,
      // smsNotice: smsResult.reason || undefined,
      emailSent: emailResult.sent,
      emailNotice: emailResult.reason || undefined,
      // Provided in response for easy testing/development
      otp: plainOtp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
