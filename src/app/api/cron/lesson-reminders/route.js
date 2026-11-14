import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendLessonEmail } from '../../../../lib/notifications';
import { safeSignatureEquals } from '../../../../lib/payments';

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeSignatureEquals(`Bearer ${secret}`, request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const now = new Date();
  const configuredWindow = Number(process.env.LESSON_REMINDER_WINDOW_MINUTES || 60);
  const windowMinutes = Number.isFinite(configuredWindow) ? Math.max(1, Math.min(configuredWindow, 1440)) : 60;
  const lessons = await prisma.lesson.findMany({
    where: {
      status: 'CONFIRMED',
      reminderSentAt: null,
      scheduledAt: { gt: now, lte: new Date(now.getTime() + windowMinutes * 60_000) },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 100,
    include: {
      student: { select: { email: true, name: true } },
      tutor: { select: { email: true, name: true } },
    },
  });

  let sent = 0;
  for (const lesson of lessons) {
    const results = await Promise.all([
      sendLessonEmail({ recipient: lesson.student, subject: 'Reminder: your lesson is coming up', heading: 'Lesson reminder', message: `Your lesson with ${lesson.tutor.name} starts soon.`, lesson, idempotencyKey: `lesson-reminder/student/${lesson.id}` }),
      sendLessonEmail({ recipient: lesson.tutor, subject: 'Reminder: your lesson is coming up', heading: 'Lesson reminder', message: `Your lesson with ${lesson.student.name} starts soon.`, lesson, idempotencyKey: `lesson-reminder/tutor/${lesson.id}` }),
    ]);
    if (results.every(Boolean)) {
      const updated = await prisma.lesson.updateMany({ where: { id: lesson.id, reminderSentAt: null }, data: { reminderSentAt: new Date() } });
      sent += updated.count;
    }
  }

  return NextResponse.json({ processed: lessons.length, remindersSent: sent });
}
