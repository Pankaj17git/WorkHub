import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q')?.trim() || '';
  const roleFilter = searchParams.get('role')?.toUpperCase() || 'ALL';
  const statusFilter = searchParams.get('status')?.toUpperCase() || 'ALL';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
  const skip = (page - 1) * limit;

  try {
    const whereClause: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (roleFilter !== 'ALL') {
      whereClause.roleRef = {
        type: roleFilter,
      };
    }

    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          profileImage: true,
          emailVerifiedAt: true,
          createdAt: true,
          roleRef: {
            select: {
              type: true,
            },
          },
          worker: {
            select: {
              id: true,
              isVerified: true,
              headline: true,
              hourlyRate: true,
            },
          },
          customer: {
            select: {
              id: true,
              companyName: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id.toString(),
      name: u.name || 'Unnamed User',
      email: u.email,
      phone: u.phone,
      status: u.status,
      profileImage: u.profileImage,
      emailVerified: Boolean(u.emailVerifiedAt),
      role: u.roleRef?.type || 'CUSTOMER',
      createdAt: u.createdAt.toISOString(),
      worker: u.worker
        ? {
            id: u.worker.id.toString(),
            isVerified: u.worker.isVerified,
            headline: u.worker.headline,
            hourlyRate: u.worker.hourlyRate ? Number(u.worker.hourlyRate) : null,
          }
        : null,
      customer: u.customer
        ? {
            id: u.customer.id.toString(),
            companyName: u.customer.companyName,
            phone: u.customer.phone,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch platform users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const { userId, status: newStatus } = body;

    if (!userId || !newStatus) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { status: newStatus },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id.toString(),
        email: updated.email,
        status: updated.status,
      },
    });
  } catch (error: unknown) {
    console.error('Admin user status update error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
