import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface CreateOtpParams {
  userId: bigint;
  expiresInMinutes?: number;
}

export interface VerifyOtpParams {
  userId: bigint;
  otp: string;
}

/**
 * Generate a random 6-digit numeric OTP string
 */
export function generateOtpCode(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}

/**
 * Hash an OTP string using bcrypt
 */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Create a new OTP record in the `otps` table
 */
export async function createOtp({ userId, expiresInMinutes = 10 }: CreateOtpParams) {
  const plainOtp = generateOtpCode(6);
  const otpHash = await hashOtp(plainOtp);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const otpRecord = await prisma.otp.create({
    data: {
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
    },
  });

  return {
    otpRecord,
    plainOtp, // To be sent via SMS / Email or Firebase
  };
}

/**
 * Verify an OTP code against the latest valid OTP in the `otps` table
 */
export async function verifyOtp({ userId, otp }: VerifyOtpParams): Promise<{ success: boolean; message: string }> {
  const now = new Date();

  // Find latest active OTP for user
  const latestOtp = await prisma.otp.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestOtp) {
    return { success: false, message: "OTP expired or does not exist" };
  }

  if (latestOtp.attempts >= 5) {
    return { success: false, message: "Maximum OTP verification attempts exceeded" };
  }

  // Increment attempt counter
  await prisma.otp.update({
    where: { id: latestOtp.id },
    data: { attempts: { increment: 1 } },
  });

  const isMatch = await bcrypt.compare(otp, latestOtp.otpHash);

  if (!isMatch) {
    return { success: false, message: "Invalid OTP code" };
  }

  // Mark OTP as used
  await prisma.otp.update({
    where: { id: latestOtp.id },
    data: { usedAt: new Date() },
  });

  return { success: true, message: "OTP verified successfully" };
}
