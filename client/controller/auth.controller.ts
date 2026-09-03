import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, signToken, loginSchema, registerSchema } from "@/app/api/auth/auth";
import { createOtp, verifyOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { status } from "@/constants/statusCodes";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const sendOtpSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(5, "Invalid phone number").optional(),
    length: z.number().min(4).max(8).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
  });

const verifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(5, "Invalid phone number").optional(),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
  });

export const authController = {
  async login(request: Request) {
    try {
      // Rate limiting (10 attempts per 15 minutes per IP)
      const ip = getClientIp(request);
      const rateCheck = await checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again later." },
          { status: status.TOO_MANY_REQUESTS }
        );
      }

      const body = await request.json();
      const result = loginSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: status.BAD_REQUEST }
        );
      }

      const { email, password } = result.data;
      const emailLowerCase = email.toLowerCase();

      const user = await prisma.user.findUnique({ where: { email: emailLowerCase } });
      
      // Check if user exists and is NOT soft-deleted
      if (!user || user.deletedAt !== null) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: status.UNAUTHORIZED }
        );
      }

      // Verify password first to prevent user enumeration
      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: status.UNAUTHORIZED }
        );
      }

      // Check user.status (PENDING_VERIFICATION or non-ACTIVE)
      if (user.status === "PENDING_VERIFICATION") {
        return NextResponse.json(
          { error: "Your account is pending verification. Please verify your email address." },
          { status: status.UNAUTHORIZED }
        );
      }

      const token = signToken({ userId: user.id.toString(), email: user.email, role: user.role });

      return NextResponse.json(
        {
          user: { id: user.id.toString(), email: user.email, name: user.name, role: user.role },
          token,
        },
        { status: status.OK }
      );
    } catch (error: any) {
      // Log server-side, return generic message to client
      console.error("Login Error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred during login." },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },

  async register(request: Request) {
    try {
      // Rate limiting (5 registrations per 15 minutes per IP)
      const ip = getClientIp(request);
      const rateCheck = await checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "Too many registration attempts. Please try again later." },
          { status: status.TOO_MANY_REQUESTS }
        );
      }

      const body = await request.json();
      const result = registerSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: status.BAD_REQUEST }
        );
      }

      const { email, password, name, role = "CUSTOMER", phone } = result.data;
      const emailLowerCase = email.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email: emailLowerCase } });
      if (existing) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: status.CONFLICT }
        );
      }

      // Validate role exists using findFirst/findUnique instead of upserting user input
      const normalizedRole = role.toUpperCase();
      const roleRecord = await prisma.role.findFirst({
        where: {
          OR: [
            { name: role },
            { name: normalizedRole }
          ]
        },
      });

      if (!roleRecord) {
        return NextResponse.json(
          { error: `Role '${role}' is invalid or does not exist` },
          { status: status.BAD_REQUEST }
        );
      }

      const hashed = await hashPassword(password);

      // Wrap user creation and OTP creation in a single database transaction
      const { user, plainOtp } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: emailLowerCase,
            password: hashed,
            name,
            role: roleRecord.name,
            phone: phone || null,
            roleId: roleRecord.id,
            status: "PENDING_VERIFICATION",
          },
        });

        const otpRes = await createOtp({ userId: newUser.id, length: 6, tx });
        return { user: newUser, plainOtp: otpRes.plainOtp };
      });

      // Dispatch email after transaction completes successfully
      if (email && !email.endsWith("@phone.workhub")) {
        const emailResult = await sendOtpEmail(email, plainOtp);
        if (!emailResult.sent && emailResult.reason) {
          console.warn("Registration OTP email dispatch warning:", emailResult.reason);
        }
      }

      return NextResponse.json(
        {
          message: "User registered successfully",
          user: { id: user.id.toString(), email: emailLowerCase, name: user.name, phone: user.phone, role: user.role },
        },
        { status: status.CREATED }
      );
    } catch (error: any) {
      // Log server-side, return generic message to client
      console.error("Register Error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred during registration." },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },

  async sendOtp(request: Request) {
    try {
      const ip = getClientIp(request);

      const body = await request.json();
      const result = sendOtpSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0]?.message || "Invalid parameters" },
          { status: status.BAD_REQUEST }
        );
      }

      const { email, phone, length = 6 } = result.data;
      const targetIdentifier = email || phone || ip;

      // Rate limiting (3 OTP send requests per 1 minute per IP/identifier)
      const rateCheck = await checkRateLimit(`send-otp:${ip}:${targetIdentifier}`, 3, 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "Too many OTP requests. Please wait a minute before requesting another code." },
          { status: status.TOO_MANY_REQUESTS }
        );
      }

      // Find user by email or phone (ensure not soft-deleted)
      let user;
      if (email) {
        user = await prisma.user.findFirst({
          where: { email: email.toLowerCase(), deletedAt: null },
        });
      } else if (phone) {
        const cleanPhone = phone.trim();
        // 1Handle non-unique phone numbers gracefully
        const matchingUsers = await prisma.user.findMany({
          where: { phone: cleanPhone, deletedAt: null },
        });

        if (matchingUsers.length > 1) {
          return NextResponse.json(
            { error: "Multiple accounts associated with this phone number. Please use your email address." },
            { status: status.BAD_REQUEST }
          );
        }
        user = matchingUsers[0] || null;
      }

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: status.NOT_FOUND }
        );
      }

      // Generate and store OTP in `otps` table
      const { plainOtp, otpRecord } = await createOtp({ userId: user.id, length });

      // Target Email dispatch
      let emailResult: { sent: boolean; method: string; reason?: string } = { sent: false, method: "none" };
      if (user.email && !user.email.endsWith("@phone.workhub")) {
        emailResult = await sendOtpEmail(user.email, plainOtp);
        if (!emailResult.sent && emailResult.reason) {
          console.warn("sendOtp email dispatch warning:", emailResult.reason);
        }
      }

      // Plain OTP removed from JSON response payload
      // Stripped emailNotice from response payload
      return NextResponse.json(
        {
          message: "OTP sent successfully",
          otpId: otpRecord.id.toString(),
          expiresAt: otpRecord.expiresAt,
          emailSent: emailResult.sent,
        },
        { status: status.OK }
      );
    } catch (error: any) {
      // Log server-side, return generic message to client
      console.error("sendOtp Error:", error);
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },

  async verifyOtp(request: Request) {
    try {
      const ip = getClientIp(request);

      const body = await request.json();
      const result = verifyOtpSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0]?.message || "Invalid input" },
          { status: status.BAD_REQUEST }
        );
      }

      const { email, phone, otp } = result.data;
      const targetIdentifier = email || phone || ip;

      // Rate limiting (5 verification attempts per 5 minutes)
      const rateCheck = await checkRateLimit(`verify-otp:${ip}:${targetIdentifier}`, 5, 5 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: "Too many failed OTP verification attempts. Please try again in 5 minutes." },
          { status: status.TOO_MANY_REQUESTS }
        );
      }

      let targetUser: any = null;

      if (email) {
        targetUser = await prisma.user.findFirst({
          where: { email: email.toLowerCase(), deletedAt: null },
        });
      } else if (phone) {
        const cleanPhone = phone.trim();
        // Handle non-unique phone lookup
        const matchingUsers = await prisma.user.findMany({
          where: { phone: cleanPhone, deletedAt: null },
        });

        if (matchingUsers.length > 1) {
          return NextResponse.json(
            { error: "Multiple accounts associated with this phone number. Please verify using email." },
            { status: status.BAD_REQUEST }
          );
        }
        targetUser = matchingUsers[0] || null;
      }

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: status.NOT_FOUND }
        );
      }

      const verification = await verifyOtp({ userId: targetUser.id, otp });

      if (!verification.success) {
        return NextResponse.json(
          { error: verification.message },
          { status: status.BAD_REQUEST }
        );
      }

      // Mark email as verified on successful OTP verification and activate user status
      if (!targetUser.emailVerifiedAt || targetUser.status === "PENDING_VERIFICATION") {
        targetUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { emailVerifiedAt: targetUser.emailVerifiedAt || new Date(), status: "ACTIVE" },
        });
      }

      // Token signing failure is NOT swallowed
      let token = "";
      try {
        token = signToken({
          userId: targetUser.id.toString(),
          email: targetUser.email,
          role: targetUser.role,
        });
      } catch (tokenErr: any) {
        console.error("JWT signing failed during verifyOtp:", tokenErr);
        return NextResponse.json(
          { error: "Failed to generate authentication token" },
          { status: status.INTERNAL_SERVER_ERROR }
        );
      }

      return NextResponse.json(
        {
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
        },
        { status: status.OK }
      );
    } catch (error: any) {
      // Log server-side, return generic message to client
      console.error("verifyOtp Error:", error);
      return NextResponse.json(
        { error: "Failed to verify OTP" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },
  
  async firebaseSession(request: Request) {
    try {
      const { phone, name, role } = await request.json();

      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: status.BAD_REQUEST }
        );
      }

      const cleanPhone = phone.trim();

      // Find or create user in Prisma database
      let user = await prisma.user.findFirst({
        where: { phone: cleanPhone, deletedAt: null },
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
              status: "ACTIVE",
            },
          });
        }
      }

      // 8. Handle token signing failure properly
      let token = "";
      try {
        token = signToken({
          userId: user.id.toString(),
          email: user.email,
          role: user.role,
        });
      } catch (tokenErr: any) {
        console.error("JWT signing failed during firebaseSession:", tokenErr);
        return NextResponse.json(
          { error: "Failed to generate authentication token" },
          { status: status.INTERNAL_SERVER_ERROR }
        );
      }

      return NextResponse.json(
        {
          message: "Firebase Phone Authentication successful",
          token,
          user: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
        { status: status.OK }
      );
    } catch (error: any) {
      console.error("Firebase Auth Session Error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: status.INTERNAL_SERVER_ERROR }
      );
    }
  },
};
