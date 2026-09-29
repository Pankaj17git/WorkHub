import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Database connection successful");

    return NextResponse.json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
      },
      { status: 500 }
    );
  }
}