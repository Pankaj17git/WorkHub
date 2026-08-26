import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, signToken, loginSchema, registerSchema } from "@/app/api/auth/auth";
import { createOtp, verifyOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { z } from "zod";

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

export const authController = {
  async login(request: Request) {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const emailLowerCase = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: emailLowerCase } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ userId: user.id.toString(), email: user.email, role: user.role });

    return NextResponse.json({
      user: { id: user.id.toString(), email: user.email, name: user.name, role: user.role },
      token,
    });
  },

  async register(request: Request) {
    try {
      const body = await request.json();
      const result = registerSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: result.error.issues[0].message,
          },
          { status: 400 }
        );
      }

      const { email, password, name, role, phone } = result.data;
      const emailLowerCase = email.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email: emailLowerCase } });
      if (existing) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      const hashed = await hashPassword(password);

      // Ensure the role exists in the roles table and link it to the user
      const roleRecord = await prisma.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role },
      });

      const user = await prisma.user.create({
        data: { email: emailLowerCase, password: hashed, name, role, phone, roleId: roleRecord.id },
      });

      let token = "";
      try {
        token = signToken({ userId: user.id.toString(), email: emailLowerCase, role: user.role });
      } catch {
        // Secret fallback
      }

      return NextResponse.json(
        {
          message: "User registered successfully",
          user: { id: user.id.toString(), email: emailLowerCase, name: user.name, phone: user.phone, role: user.role },
          token,
        },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Registration failed" },
        { status: 500 }
      );
    }
  },

  async sendOtp(request: Request) {
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

      // Target Email dispatch
      let emailResult: { sent: boolean; method: string; reason?: string } = { sent: false, method: "none" };
      if (user.email && !user.email.endsWith("@phone.workhub")) {
        emailResult = await sendOtpEmail(user.email, plainOtp);
      }

      return NextResponse.json({
        message: "OTP generated successfully",
        otpId: otpRecord.id.toString(),
        expiresAt: otpRecord.expiresAt,
        emailSent: emailResult.sent,
        emailNotice: emailResult.reason || undefined,
        otp: plainOtp,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
    }
  },

  async verifyOtp(request: Request) {
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

      // Mark email as verified on successful OTP verification
      if (!targetUser.emailVerifiedAt) {
        targetUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { emailVerifiedAt: new Date() },
        });
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
  },

  async firebaseSession(request: Request) {
    try {
      const { phone, name, role } = await request.json();

      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }

      const cleanPhone = phone.trim();

      // Find or create user in Prisma database
      let user = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });

      if (!user) {
        const cleanDigits = cleanPhone.replace(/\D/g, "");
        const tempEmail = `${cleanDigits.slice(-10)}@phone.workhub`;

        const existingByTempEmail = await prisma.user.findUnique({
          where: { email: tempEmail },
        });

        if (existingByTempEmail) {
          user = existingByTempEmail;
        } else {
          user = await prisma.user.create({
            data: {
              phone: cleanPhone,
              email: tempEmail,
              name: name || "Phone User",
              password: "",
              role: role || "CUSTOMER",
            },
          });
        }
      }

      // Generate internal JWT token
      let token = "";
      try {
        token = signToken({
          userId: user.id.toString(),
          email: user.email,
          role: user.role,
        });
      } catch {
        // Secret fallback
      }

      return NextResponse.json({
        message: "Firebase Phone Authentication successful",
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Firebase Auth Session Error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create session" },
        { status: 500 }
      );
    }
  },
};
