import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/auth';
import { consumeRateLimit } from '../../../lib/rate-limit';
import { BookingConflictError, GuardianConsentRequiredError, OutsideAvailabilityError, hasLessonConflict, lockBookingParticipants, requireAvailableSlot } from '../../../lib/bookings';
import { isValidTimeZone } from '../../../lib/bookings';
import { lessonBookingSchema, validationMessage } from '../../../lib/validation';
import { notifyLessonRequest } from '../../../lib/notifications';
import { reportException } from '../../../lib/observability';

export async function GET() {
  const user = await requireUser();
  if (!user || !['STUDENT', 'TUTOR'].includes(user.role)) return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
  const lessons = await prisma.lesson.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      ...(user.role === 'STUDENT' ? { studentId: user.id } : { tutorId: user.id }),
    },
    orderBy: { scheduledAt: 'asc' }, take: 30,
    select: {
      id: true, title: true, topic: true, scheduledAt: true, durationMins: true, status: true, timeZone: true,
      pendingActionById: true, previousScheduledAt: true, previousDurationMins: true, pendingActionReason: true,
      studentId: true, tutorId: true,
      student: { select: { id: true, name: true, timeZone: true } },
      tutor: { select: { id: true, name: true, timeZone: true } },
    },
  });
  return NextResponse.json({ lessons: lessons.map((lesson) => ({
    ...lesson,
    viewerTimeZone: user.timeZone,
    counterpartyTimeZone: user.role === 'STUDENT' ? lesson.tutor.timeZone : lesson.student.timeZone,
    pendingActionByMe: lesson.pendingActionById === user.id,
  })) });
}

export async function POST(request) {
  try {
    const student = await requireUser('STUDENT');
    if (!student) return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
    const rate = await consumeRateLimit({ scope: 'student-booking', identity: student.id, limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rate.allowed) return NextResponse.json({ error: rate.unavailable ? 'Booking is temporarily unavailable.' : 'Too many booking requests. Try again later.' }, { status: rate.unavailable ? 503 : 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } });

    const body = await request.json().catch(() => null);
    const validation = lessonBookingSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    const booking = validation.data;
    if (!isValidTimeZone(booking.timeZone)) return NextResponse.json({ error: 'Enter a valid time zone.' }, { status: 400 });
    const scheduledAt = new Date(booking.scheduledAt);
    if (scheduledAt <= new Date()) return NextResponse.json({ error: 'Choose a future time.' }, { status: 400 });

    const tutor = await prisma.tutorProfile.findFirst({
      where: { id: booking.tutorProfileId, isVerified: true, openForStudents: true },
      select: { userId: true, user: { select: { id: true, timeZone: true } } },
    });
    if (!tutor) return NextResponse.json({ error: 'This tutor is not available for booking.' }, { status: 404 });
    const [block, studentAccount] = await Promise.all([
      prisma.userBlock.findFirst({ where: { OR: [{ blockerId: student.id, blockedId: tutor.userId }, { blockerId: tutor.userId, blockedId: student.id }] }, select: { blockerId: true } }),
      prisma.user.findUnique({ where: { id: student.id }, select: { isMinor: true } }),
    ]);
    if (block) return NextResponse.json({ error: 'This interaction is unavailable.' }, { status: 403 });
    if (studentAccount?.isMinor) {
      const consent = await prisma.guardianConsent.findUnique({ where: { studentId: student.id }, select: { status: true } });
      if (consent?.status !== 'APPROVED') return NextResponse.json({ error: 'A parent or guardian must complete consent review before booking.' }, { status: 403 });
    }

    const lesson = await prisma.$transaction(async (tx) => {
      await lockBookingParticipants(tx, [student.id, tutor.userId]);
      const currentStudent = await tx.user.findUnique({ where: { id: student.id }, select: { isMinor: true } });
      if (currentStudent?.isMinor) {
        const consent = await tx.guardianConsent.findUnique({ where: { studentId: student.id }, select: { status: true } });
        if (consent?.status !== 'APPROVED') throw new GuardianConsentRequiredError();
      }
      const tutorAccount = await tx.user.findUnique({ where: { id: tutor.userId }, select: { timeZone: true } });
      await requireAvailableSlot(tx, tutor.userId, scheduledAt, booking.durationMins, tutorAccount.timeZone);
      if (await hasLessonConflict(tx, { studentId: student.id, tutorId: tutor.userId, scheduledAt, durationMins: booking.durationMins })) {
        throw new BookingConflictError();
      }
      await tx.user.update({ where: { id: student.id }, data: { timeZone: booking.timeZone } });
      await tx.tutorSelection.upsert({ where: { studentId_tutorId: { studentId: student.id, tutorId: tutor.userId } }, create: { studentId: student.id, tutorId: tutor.userId }, update: {} });
      return tx.lesson.create({
        data: {
          title: booking.title, topic: booking.topic || null, scheduledAt, durationMins: booking.durationMins,
          status: 'PENDING', pendingActionById: student.id, timeZone: booking.timeZone,
          studentId: student.id, tutorId: tutor.userId,
        },
        select: { id: true, title: true, scheduledAt: true, durationMins: true, status: true, timeZone: true },
      });
    });
    try { await notifyLessonRequest(lesson.id); } catch (error) { console.error('Booking notification failed:', error); }
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingConflictError || error instanceof OutsideAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof GuardianConsentRequiredError) return NextResponse.json({ error: error.message }, { status: 403 });
    reportException('lessons.create', error);
    return NextResponse.json({ error: 'Unable to request this lesson.' }, { status: 500 });
  }
}
