import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("🔌 Testing MySQL connection...");

    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ MySQL connection successful");

    return NextResponse.json({
      success: true,
      database: "connected",
    });
  } catch (error: unknown) {
    const prismaError = error as { message?: string; code?: string; cause?: unknown };
    console.error("❌ MySQL connection failed");
    console.error("Error:", error);
    console.error("Message:", prismaError?.message);
    console.error("Code:", prismaError?.code);
    console.error("Cause:", prismaError?.cause);

    return NextResponse.json(
      {
        success: false,
        database: "disconnected",
        error: prismaError?.message ?? "Unknown database error",
        code: prismaError?.code ?? null,
      },
      { status: 500 }
    );
  }
}