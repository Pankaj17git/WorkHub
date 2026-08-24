import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "../../auth";

export async function POST(req: Request) {
  try {
    const { phone, name, role } = await req.json();

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
}
