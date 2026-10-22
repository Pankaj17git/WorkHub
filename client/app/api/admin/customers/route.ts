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

  try {
    const whereClause: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            jobs: true,
            assignments: true,
            directHireRequests: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => ({
      id: c.id.toString(),
      userId: c.userId.toString(),
      name: c.user.name || 'Homeowner / Client',
      email: c.user.email,
      phone: c.phone || c.user.phone,
      profileImage: c.avatar || c.user.profileImage,
      companyName: c.companyName,
      status: c.user.status,
      stats: {
        postedJobs: c._count.jobs,
        assignments: c._count.assignments,
        directHireRequests: c._count.directHireRequests,
      },
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      customers: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    console.error('Admin customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
