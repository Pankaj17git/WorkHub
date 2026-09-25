import { UserRole } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";



export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  role: z.enum(["CUSTOMER", "WORKER","CONTRACTOR"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const JWT_SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: UserRole }) {
  return jwt.sign(
    { ...payload, userId: payload.userId.toString() },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: UserRole };
  } catch {
    return null;
  }
}


