import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { approvalUpdateSchema, validationMessage } from '../../../../lib/validation';

/**
 * GET /api/manager/overview
 * Returns platform-wide metrics + approvals + goals for the manager.
 */
export async function GET() {
  try {
    const manager = await requireUser('MANAGER');
    if (!manager) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    // Parallel DB queries
    const [
      totalUsers,
      students,
      tutors,
      verifiedTutors,
      totalLessons,
      upcomingLessons,
      totalTickets,
      openTickets,
      approvals,
      goals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TUTOR' } }),
      prisma.tutorProfile.count({ where: { isVerified: true } }),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { scheduledAt: { gte: new Date() }, status: { in: ['CONFIRMED', 'PENDING'] } } }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.approval.findMany({
        where: { managerId: manager.id },
        orderBy: { createdAt: 'desc' },
        include: { requester: { select: { name: true, email: true, role: true } } },
      }),
      prisma.goal.findMany({
        where: { managerId: manager.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');

    const goalStats = {
      total: goals.length,
      onTrack: goals.filter((g) => g.status === 'ON_TRACK').length,
      atRisk: goals.filter((g) => g.status === 'AT_RISK').length,
      offTrack: goals.filter((g) => g.status === 'OFF_TRACK').length,
    };

    return NextResponse.json({
      manager,
      metrics: {
        totalUsers,
        students,
        tutors,
        verifiedTutors,
        totalLessons,
        upcomingLessons,
        totalTickets,
        openTickets,
        pendingApprovalsCount: pendingApprovals.length,
        goalStats,
      },
      approvals,
      goals,
    });
  } catch (err) {
    console.error('Manager overview failed:', err);
    return NextResponse.json({ error: 'Unable to load manager overview.' }, { status: 500 });
  }
}

/**
 * PATCH /api/manager/overview
 * Approve or reject a pending approval.
 * Body: { approvalId, status: 'APPROVED' | 'REJECTED' }
 */
export async function PATCH(request) {
  try {
    const manager = await requireUser('MANAGER');
    if (!manager) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = approvalUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { approvalId, status } = validation.data;

    const approval = await prisma.approval.findFirst({
      where: { id: approvalId, managerId: manager.id },
    });

    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    const updated = await prisma.approval.update({
      where: { id: approvalId },
      data: { status },
      include: { requester: { select: { name: true } } },
    });

    return NextResponse.json({ approval: updated });
  } catch (err) {
    console.error('Approval update failed:', err);
    return NextResponse.json({ error: 'Unable to update approval.' }, { status: 500 });
  }
}
