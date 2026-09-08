import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: NextRequest): bigint | null => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return null;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    return BigInt(decodedToken.userId);
  } catch (error: unknown) {
    console.error("Auth middleware error:", error);
    return null;
  }
};
