import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { legacyTutorVerificationSchema, validationMessage } from '../../../../lib/validation';

/**
 * GET /api/admin/overview
 * Returns platform-wide admin stats: user counts by role, lesson/ticket totals,
 * tutor verification status, recent users.
 * Uses sequential batches to stay within the DB connection pool limit.
 */
export async function GET() {
  try {
    const admin = await requireUser('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Batch 1 – user counts (all small scalar queries)
    const [totalUsers, students, tutors, admins, specialists, managers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TUTOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'SUPPORT_SPECIALIST' } }),
      prisma.user.count({ where: { role: 'MANAGER' } }),
    ]);

    // Batch 2 – tutor profiles + lessons + assignments
    const [verifiedTutors, unverifiedTutors, totalLessons, confirmedLessons, totalAssignments] = await Promise.all([
      prisma.tutorProfile.count({ where: { isVerified: true } }),
      prisma.tutorProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { status: 'CONFIRMED' } }),
      prisma.assignment.count(),
    ]);

    // Scheduled lessons by week over the last eight weeks.
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
    const firstWeekStart = new Date(currentWeekStart);
    firstWeekStart.setDate(firstWeekStart.getDate() - 7 * 7);
    const weeklyLessons = await prisma.lesson.findMany({
      where: { scheduledAt: { gte: firstWeekStart, lt: new Date(currentWeekStart.getTime() + 7 * 86400000) } },
      select: { scheduledAt: true },
    });
    const lessonsByWeek = Array.from({ length: 8 }, (_, index) => {
      const weekStart = new Date(firstWeekStart);
      weekStart.setDate(weekStart.getDate() + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return {
        week: weekStart.toISOString().slice(0, 10),
        count: weeklyLessons.filter(({ scheduledAt }) => scheduledAt >= weekStart && scheduledAt < weekEnd).length,
      };
    });

    // Batch 3 – assignment statuses + tickets
    const [pendingAssignments, completedAssignments, totalTickets, openTickets] = await Promise.all([
      prisma.assignment.count({ where: { status: 'PENDING' } }),
      prisma.assignment.count({ where: { status: 'COMPLETED' } }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
    ]);

    // Batch 4 – ticket statuses + recent users
    const [resolvedTickets, escalatedTickets, recentUsers, pendingTutors] = await Promise.all([
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'ESCALATED' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          tutorProfile: { select: { isVerified: true } },
        },
      }),
      prisma.tutorProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        orderBy: { user: { createdAt: 'asc' } },
        select: {
          userId: true,
          user: { select: { name: true, email: true, createdAt: true } },
        },
      }),
    ]);

    const roleBreakdown = [
      { role: 'STUDENT',            count: students,    pct: Math.round((students    / Math.max(totalUsers, 1)) * 100) },
      { role: 'TUTOR',              count: tutors,      pct: Math.round((tutors      / Math.max(totalUsers, 1)) * 100) },
      { role: 'SUPPORT_SPECIALIST', count: specialists, pct: Math.round((specialists / Math.max(totalUsers, 1)) * 100) },
      { role: 'MANAGER',            count: managers,    pct: Math.round((managers    / Math.max(totalUsers, 1)) * 100) },
      { role: 'ADMIN',              count: admins,      pct: Math.round((admins      / Math.max(totalUsers, 1)) * 100) },
    ];

    return NextResponse.json({
      admin,
      metrics: {
        totalUsers,
        students,
        tutors,
        verifiedTutors,
        unverifiedTutors,
        totalLessons,
        confirmedLessons,
        totalAssignments,
        pendingAssignments,
        completedAssignments,
        totalTickets,
        openTickets,
        resolvedTickets,
        escalatedTickets,
      },
      roleBreakdown,
      lessonsByWeek,
      pendingVerifications: unverifiedTutors,
      recentUsers,
      pendingTutors,
    });
  } catch (err) {
    console.error('Admin overview failed:', err);
    return NextResponse.json({ error: 'Unable to load admin overview.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/overview (legacy verification endpoint)
 * Body: { tutorUserId, isVerified: boolean }
 */
export async function PATCH(request) {
  try {
    const admin = await requireUser('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = legacyTutorVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { tutorUserId, isVerified } = validation.data;

    const profile = await prisma.tutorProfile.findFirst({
      where: { userId: tutorUserId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    if (isVerified) {
      const approvedTypes = await prisma.verificationDocument.findMany({
        where: { tutorId: tutorUserId, status: 'APPROVED' },
        select: { type: true },
      });
      const types = new Set(approvedTypes.map((document) => document.type));
      if (!types.has('NATIONAL_ID') || !types.has('DEGREE_CERTIFICATE')) {
        return NextResponse.json({ error: 'Approve a national ID and degree certificate before verifying this tutor.' }, { status: 409 });
      }
    }

    const updated = await prisma.tutorProfile.update({
      where: { userId: tutorUserId },
      data: {
        isVerified,
        verificationStatus: isVerified ? 'APPROVED' : 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: { actorId: admin.id, action: `tutor.verification.${isVerified ? 'approved' : 'pending'}`, targetType: 'TutorProfile', targetId: tutorUserId },
    });

    return NextResponse.json({ tutorProfile: updated });
  } catch (err) {
    console.error('Admin tutor verify failed:', err);
    return NextResponse.json({ error: 'Unable to update tutor verification.' }, { status: 500 });
  }
}
