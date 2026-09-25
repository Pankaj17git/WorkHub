import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: NextRequest): bigint | null => {
  try {
    const headerToken = req.headers.get("Authorization")?.split(" ")[1];
    const cookieToken = req.cookies.get("wh_token")?.value;
    const token = headerToken || cookieToken;

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
