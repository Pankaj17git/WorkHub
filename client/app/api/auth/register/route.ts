import { NextResponse } from "next/server";
import { hashPassword, registerSchema, signToken } from "../auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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
    const user = await prisma.user.create({
      data: { email: emailLowerCase, password: hashed, name, role, phone },
    });

    let token = "";
    try {
      token = signToken({ userId: user.id.toString(), email: emailLowerCase, role: user.role });
    } catch {
      // Secret fallback
    }

    // Send OTP after registration
    

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
}