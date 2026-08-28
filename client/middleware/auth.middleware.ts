import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const authMiddleware = (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const decodedToken = jwt.verify(token as string, process.env.JWT_SECRET as string) as { userId: any; email: string; role: string };
    const userId = decodedToken.userId;
    return userId;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid request!" },
      { status: 401 }
    );
  }
};