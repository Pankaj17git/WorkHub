import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, loginSchema } from "../auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user.id.toString(), email: user.email, role: user.role });

  return NextResponse.json({
    user: { id: user.id.toString(), email: user.email, name: user.name, role: user.role },
    token,
  });
}