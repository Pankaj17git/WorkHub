import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  try {
    const [
      totalUsers,
      totalWorkers,
      totalCustomers,
      totalSkills,
      customSkillsCount,
      totalJobs,
      totalAssignments,
      activeUsersCount,
      recentUsers,
      recentSkills,
      topSkills,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.worker.count({ where: { deletedAt: null } }),
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.skill.count(),
      prisma.skill.count({ where: { isCustom: true } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.assignment.count(),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          roleRef: {
            select: {
              type: true,
            },
          },
        },
      }),
      prisma.skill.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          _count: {
            select: { workers: true },
          },
        },
      }),
      prisma.skill.findMany({
        take: 8,
        orderBy: {
          workers: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: { workers: true },
          },
        },
      }),
    ]);

    // Format BigInt values
    const safeRecentUsers = recentUsers.map((u) => ({
      id: u.id.toString(),
      name: u.name || 'Anonymous User',
      email: u.email,
      status: u.status,
      role: u.roleRef?.type || 'CUSTOMER',
      createdAt: u.createdAt.toISOString(),
    }));

    const safeRecentSkills = recentSkills.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      key: s.key,
      isCustom: s.isCustom,
      workersCount: s._count.workers,
      createdAt: s.createdAt.toISOString(),
    }));

    const safeTopSkills = topSkills.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      key: s.key,
      workersCount: s._count.workers,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalWorkers,
        totalCustomers,
        totalAdmins: totalUsers - (totalWorkers + totalCustomers),
        activeUsersCount,
        totalSkills,
        customSkillsCount,
        totalJobs,
        totalAssignments,
      },
      recentUsers: safeRecentUsers,
      recentSkills: safeRecentSkills,
      topSkills: safeTopSkills,
    });
  } catch (error: unknown) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve administrative statistics' },
      { status: 500 }
    );
  }
}
