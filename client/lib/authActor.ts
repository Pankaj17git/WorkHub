import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface AuthActor {
  userId: bigint;
  email: string;
  role: "CUSTOMER" | "WORKER" | "ADMIN" | "CONTRACTOR";
  customer: { id: bigint; addressId: bigint | null } | null;
  worker: { id: bigint; isVerified: boolean; addressId: bigint | null } | null;
}

export async function getAuthActor(req: NextRequest): Promise<AuthActor | null> {
  try {
    const headerToken = req.headers.get("Authorization")?.split(" ")[1];
    const cookieToken = req.cookies.get("wh_token")?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    const userId = BigInt(decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleRef: true,
        customer: true,
        worker: true,
      },
    });

    if (!user || user.deletedAt !== null || user.status !== "ACTIVE") {
      return null;
    }

    const role = (user.roleRef?.type || "CUSTOMER") as AuthActor["role"];

    return {
      userId: user.id,
      email: user.email,
      role,
      customer: user.customer
        ? {
            id: user.customer.id,
            addressId: user.customer.addressId,
          }
        : null,
      worker: user.worker
        ? {
            id: user.worker.id,
            isVerified: user.worker.isVerified,
            addressId: user.worker.addressId,
          }
        : null,
    };
  } catch (error) {
    console.error("getAuthActor error:", error);
    return null;
  }
}
