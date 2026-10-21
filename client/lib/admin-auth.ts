import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export interface AdminAuthResult {
  authorized: boolean;
  userId?: bigint;
  userEmail?: string;
  error?: string;
  statusCode?: number;
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  try {
    const authHeader = req.headers.get('authorization')?.split(' ')[1];
    const cookieToken = req.cookies.get('wh_token')?.value;
    const token = authHeader || cookieToken;

    if (!token) {
      return { authorized: false, error: 'Authentication required', statusCode: 401 };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return { authorized: false, error: 'Server configuration error', statusCode: 500 };
    }

    const decoded = jwt.verify(token, secret) as {
      userId?: string;
      email?: string;
      role?: string;
    };

    if (decoded.role !== 'ADMIN') {
      return {
        authorized: false,
        error: 'Forbidden: Administrator privileges required',
        statusCode: 403,
      };
    }

    const userId = BigInt(decoded.userId!);
    return {
      authorized: true,
      userId,
      userEmail: decoded.email,
    };
  } catch (error: unknown) {
    console.error('verifyAdminRequest error:', error);
    return { authorized: false, error: 'Invalid or expired token', statusCode: 401 };
  }
}
