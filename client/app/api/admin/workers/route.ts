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
        { headline: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const workers = await prisma.worker.findMany({
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
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                key: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            assignments: true,
            reviews: true,
          },
        },
      },
    });

    const formatted = workers.map((w) => ({
      id: w.id.toString(),
      userId: w.userId.toString(),
      name: w.user.name || 'Unnamed Worker',
      email: w.user.email,
      phone: w.user.phone,
      profileImage: w.user.profileImage,
      status: w.user.status,
      headline: w.headline || 'Independent Service Professional',
      bio: w.bio,
      isVerified: w.isVerified,
      hourlyRate: w.hourlyRate ? Number(w.hourlyRate) : null,
      skills: w.skills.map((ws) => ({
        id: ws.skill.id.toString(),
        name: ws.skill.name,
        key: ws.skill.key,
      })),
      stats: {
        applications: w._count.applications,
        assignments: w._count.assignments,
        reviews: w._count.reviews,
      },
      createdAt: w.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      workers: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    console.error('Admin workers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}
