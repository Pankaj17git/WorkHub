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
    const whereClause: Record<string, unknown> = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { key: { contains: search } },
      ];
    }

    const skills = await prisma.skill.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { workers: true },
        },
      },
    });

    const formatted = skills.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      key: s.key,
      isCustom: s.isCustom,
      createdBy: s.createdBy ? s.createdBy.toString() : null,
      workersCount: s._count.workers,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      skills: formatted,
      total: formatted.length,
    });
  } catch (error: unknown) {
    console.error('Admin skills GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  try {
    const body = await request.json();
    const name = body?.name?.trim();
    let key = body?.key?.trim()?.toLowerCase();
    const isCustom = Boolean(body?.isCustom ?? false);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Skill name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Auto-generate key if missing
    if (!key) {
      key = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 80);
    }

    // Check for duplicate key or duplicate exact name
    const existing = await prisma.skill.findFirst({
      where: {
        OR: [{ name: { equals: name } }, { key: { equals: key } }],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `A skill with name "${existing.name}" or key "${existing.key}" already exists.`,
        },
        { status: 409 }
      );
    }

    const created = await prisma.skill.create({
      data: {
        name,
        key,
        isCustom,
        createdBy: auth.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Skill added to database successfully',
        skill: {
          id: created.id.toString(),
          name: created.name,
          key: created.key,
          isCustom: created.isCustom,
          workersCount: 0,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Admin skill POST error:', error);
    return NextResponse.json({ error: 'Failed to add skill to database' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
  }

  try {
    const skillId = BigInt(id);

    // Check how many workers use this skill
    const workerCount = await prisma.workerSkill.count({
      where: { skillId },
    });

    if (workerCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete skill because ${workerCount} worker(s) are currently associated with it.`,
        },
        { status: 400 }
      );
    }

    await prisma.skill.delete({
      where: { id: skillId },
    });

    return NextResponse.json({
      success: true,
      message: 'Skill deleted from database',
    });
  } catch (error: unknown) {
    console.error('Admin skill DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
