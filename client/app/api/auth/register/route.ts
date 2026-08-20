import { NextResponse } from "next/server";
import { hashPassword, registerSchema, signToken } from "../auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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
  const { email, password, name, role, phone } = await request.json();
  const emailLowerCase = email.toLowerCase();
  if (!email || !password || !name || !role || !phone) {
    return NextResponse.json(
      { error: "Email, name, role and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: emailLowerCase } });
  if (existing) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: emailLowerCase, password: hashed, name, role, phone },
  });

  const token = signToken({ userId: user.id.toString(), email: emailLowerCase, role: user.role });

  return NextResponse.json(
    { user: { id: user.id.toString(), email: emailLowerCase, name: user.name, role: user.role }, token },
    { status: 201 }
  );
}