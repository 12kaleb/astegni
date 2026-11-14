import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const appUser = await requireUser('TUTOR');
    if (!appUser) return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [lessonData, studentRecords] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', l.id, 'title', l.title, 'topic', l.topic, 'scheduledAt', l."scheduledAt",
              'durationMins', l."durationMins", 'status', l.status, 'meetingUrl', l."meetingUrl",
              'studentId', l."studentId", 'student', json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatarUrl', u."avatarUrl", 'phone', u.phone)
            ) ORDER BY l."scheduledAt" ASC)
            FROM (SELECT * FROM "Lesson" WHERE "tutorId" = ${appUser.id} AND "scheduledAt" >= ${now} AND status IN ('CONFIRMED', 'PENDING') ORDER BY "scheduledAt" ASC LIMIT 20) l
            JOIN "User" u ON u.id = l."studentId"
          ), '[]'::json) AS lessons,
          COALESCE((
            SELECT json_agg(json_build_object(
              'id', l.id, 'title', l.title, 'topic', l.topic, 'scheduledAt', l."scheduledAt",
              'durationMins', l."durationMins", 'status', l.status, 'studentId', l."studentId",
              'student', json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatarUrl', u."avatarUrl")
            ) ORDER BY l."scheduledAt" DESC)
            FROM (SELECT * FROM "Lesson" WHERE "tutorId" = ${appUser.id} AND "scheduledAt" < ${now} ORDER BY "scheduledAt" DESC LIMIT 20) l
            JOIN "User" u ON u.id = l."studentId"
          ), '[]'::json) AS "pastLessons",
          COALESCE((
            SELECT SUM("durationMins") FROM "Lesson"
            WHERE "tutorId" = ${appUser.id} AND "scheduledAt" >= ${startOfMonth} AND status = 'COMPLETED'
          ), 0)::int AS "monthMinutes"
      `,
      prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { studentLessons: { some: { tutorId: appUser.id } } },
            { selectedTutors: { some: { tutorId: appUser.id } } },
          ],
        },
        select: { id: true, name: true, email: true, avatarUrl: true, phone: true },
      }),
    ]);

    const stats = lessonData[0] || { lessons: [], pastLessons: [], monthMinutes: 0 };
    const lessons = stats.lessons;
    const pastLessons = stats.pastLessons;
    const hoursTaughtMonth = Math.round((Number(stats.monthMinutes || 0) / 60) * 10) / 10;
    const rateETB = appUser.tutorProfile?.hourlyRateETB ?? 0;
    const estimatedLessonValueETB = rateETB == null ? null : Math.round(hoursTaughtMonth * rateETB);

    return NextResponse.json({
      lessons,
      pastLessons,
      lessonCount: lessons.length,
      completedLessonCount: pastLessons.length,
      activeStudentCount: studentRecords.length,
      students: studentRecords,
      hoursTaughtMonth,
      estimatedLessonValueETB,
    });
  } catch (error) {
    console.error('Failed to load tutor lessons:', error);
    return NextResponse.json({ error: 'Unable to load lessons.' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Students must create lesson requests; tutors respond through the booking workflow.' }, { status: 410 });
}
