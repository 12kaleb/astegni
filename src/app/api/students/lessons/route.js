import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        studentId: appUser.id,
        scheduledAt: { gte: new Date() },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        title: true,
        topic: true,
        scheduledAt: true,
        durationMins: true,
        status: true,
        meetingUrl: true,
        payment: { select: { status: true, currency: true, checkoutUrl: true } },
        tutor: {
          select: {
            name: true,
            avatarUrl: true,
            tutorProfile: { select: { hourlyRateETB: true, hourlyRateUSD: true } },
          },
        },
      },
    });

    const lesson = lessons[0] || null;

    return Response.json({ lesson, lessons });
  } catch {
    return Response.json(
      { error: 'Unable to load your next lesson.' },
      { status: 500 }
    );
  }
}
