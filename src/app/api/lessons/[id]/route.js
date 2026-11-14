import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { OutsideAvailabilityError, canRescheduleAgain, hasLessonConflict, isWithinCancellationWindow, lockBookingParticipants, requireAvailableSlot } from '../../../../lib/bookings';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../lib/rate-limit';
import { lessonActionSchema, validationMessage } from '../../../../lib/validation';
import { notifyLessonConfirmed } from '../../../../lib/notifications';
import { reportException } from '../../../../lib/observability';
import { createMeetingUrl } from '../../../../lib/video';

export async function PATCH(request, context) {
  try {
    const actor = await requireUser();
    if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
    const rate = await consumeRateLimit({ scope: 'lesson-update', identity: actor.id, limit: 20, windowMs: 15 * 60 * 1000 });
    if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many lesson updates. Try again later.');
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const validation = lessonActionSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    const input = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.lesson.findUnique({ where: { id } });
      if (!current) return { error: 'Lesson not found.', status: 404 };
      const isTutor = actor.id === current.tutorId && actor.role === 'TUTOR';
      const isStudent = actor.id === current.studentId && actor.role === 'STUDENT';
      if (!isTutor && !isStudent) return { error: 'This lesson is not yours to update.', status: 404 };

      await lockBookingParticipants(tx, [current.studentId, current.tutorId]);
      const lesson = await tx.lesson.findUnique({ where: { id } });
      const active = lesson.status === 'PENDING' || lesson.status === 'CONFIRMED';
      if (!active) return { error: 'This lesson is no longer active.', status: 409 };

      if (!['CANCEL', 'DECLINE', 'DECLINE_RESCHEDULE'].includes(input.action)) {
        const [block, student] = await Promise.all([
          tx.userBlock.findFirst({ where: { OR: [{ blockerId: lesson.studentId, blockedId: lesson.tutorId }, { blockerId: lesson.tutorId, blockedId: lesson.studentId }] }, select: { blockerId: true } }),
          tx.user.findUnique({ where: { id: lesson.studentId }, select: { isMinor: true } }),
        ]);
        if (block) return { error: 'This interaction is unavailable.', status: 403 };
        if (student?.isMinor) {
          const consent = await tx.guardianConsent.findUnique({ where: { studentId: lesson.studentId }, select: { status: true } });
          if (consent?.status !== 'APPROVED') return { error: 'Parent or guardian consent is not currently approved.', status: 403 };
        }
      }

      if (input.action === 'CONFIRM' || input.action === 'DECLINE') {
        if (!isTutor || lesson.status !== 'PENDING' || lesson.previousScheduledAt || lesson.pendingActionById !== lesson.studentId) {
          return { error: 'Only the tutor can respond to a new booking request.', status: 409 };
        }
        if (input.action === 'DECLINE') {
          const updated = await tx.lesson.update({ where: { id }, data: { status: 'CANCELLED', cancelledById: actor.id, cancellationReason: input.reason || 'Declined by tutor', pendingActionById: null } });
          return { lesson: updated };
        }
        if (lesson.scheduledAt <= new Date()) return { error: 'This booking time has passed.', status: 409 };
        const tutor = await tx.user.findUnique({ where: { id: lesson.tutorId }, select: { timeZone: true } });
        await requireAvailableSlot(tx, lesson.tutorId, lesson.scheduledAt, lesson.durationMins, tutor.timeZone);
        if (await hasLessonConflict(tx, { studentId: lesson.studentId, tutorId: lesson.tutorId, scheduledAt: lesson.scheduledAt, durationMins: lesson.durationMins, excludeId: id })) {
          return { error: 'A participant now has another lesson during that time.', status: 409 };
        }
        const updated = await tx.lesson.update({ where: { id }, data: { status: 'CONFIRMED', pendingActionById: null, meetingUrl: lesson.meetingUrl || createMeetingUrl() } });
        return { lesson: updated };
      }

      if (input.action === 'CANCEL') {
        const protectedTime = lesson.previousScheduledAt || lesson.scheduledAt;
        if (isWithinCancellationWindow(protectedTime)) return { error: 'Lessons cannot be cancelled within 24 hours of their start time.', status: 409 };
        const updated = await tx.lesson.update({ where: { id }, data: { status: 'CANCELLED', cancelledById: actor.id, cancellationReason: input.reason, pendingActionById: null, previousScheduledAt: null, previousDurationMins: null } });
        return { lesson: updated };
      }

      if (input.action === 'RESCHEDULE') {
        if (lesson.status !== 'CONFIRMED' || lesson.previousScheduledAt || !canRescheduleAgain(lesson.rescheduleCount)) return { error: 'This lesson cannot be rescheduled again.', status: 409 };
        if (isWithinCancellationWindow(lesson.scheduledAt)) return { error: 'Lessons cannot be rescheduled within 24 hours of their start time.', status: 409 };
        const nextTime = new Date(input.scheduledAt);
        if (nextTime <= new Date()) return { error: 'Choose a future time.' , status: 400 };
        const tutor = await tx.user.findUnique({ where: { id: lesson.tutorId }, select: { timeZone: true } });
        await requireAvailableSlot(tx, lesson.tutorId, nextTime, input.durationMins, tutor.timeZone);
        if (await hasLessonConflict(tx, { studentId: lesson.studentId, tutorId: lesson.tutorId, scheduledAt: nextTime, durationMins: input.durationMins, excludeId: id })) return { error: 'A participant already has a lesson during that time.', status: 409 };
        await tx.user.update({ where: { id: actor.id }, data: { timeZone: input.timeZone } });
        const updated = await tx.lesson.update({ where: { id }, data: {
          previousScheduledAt: lesson.scheduledAt, previousDurationMins: lesson.durationMins,
          scheduledAt: nextTime, durationMins: input.durationMins, status: 'PENDING', pendingActionById: actor.id,
          pendingActionReason: input.reason,
        } });
        return { lesson: updated };
      }

      if (!lesson.previousScheduledAt || lesson.status !== 'PENDING' || lesson.pendingActionById === actor.id) return { error: 'There is no reschedule proposal for you to answer.', status: 409 };
      if (input.action === 'DECLINE_RESCHEDULE') {
        if (lesson.previousScheduledAt <= new Date()) {
          const updated = await tx.lesson.update({ where: { id }, data: { status: 'CANCELLED', cancelledById: actor.id, cancellationReason: 'Reschedule declined after original lesson time', pendingActionById: null, previousScheduledAt: null, previousDurationMins: null, pendingActionReason: null } });
          return { lesson: updated };
        }
        const updated = await tx.lesson.update({ where: { id }, data: {
          scheduledAt: lesson.previousScheduledAt, durationMins: lesson.previousDurationMins || lesson.durationMins,
          previousScheduledAt: null, previousDurationMins: null, pendingActionById: null, pendingActionReason: null, status: 'CONFIRMED',
        } });
        return { lesson: updated };
      }
      if (input.action === 'ACCEPT_RESCHEDULE') {
        if (lesson.scheduledAt <= new Date()) return { error: 'The proposed booking time has passed.', status: 409 };
        const tutor = await tx.user.findUnique({ where: { id: lesson.tutorId }, select: { timeZone: true } });
        await requireAvailableSlot(tx, lesson.tutorId, lesson.scheduledAt, lesson.durationMins, tutor.timeZone);
        if (await hasLessonConflict(tx, { studentId: lesson.studentId, tutorId: lesson.tutorId, scheduledAt: lesson.scheduledAt, durationMins: lesson.durationMins, excludeId: id })) return { error: 'A participant now has another lesson during the proposed time.', status: 409 };
        const updated = await tx.lesson.update({ where: { id }, data: {
          previousScheduledAt: null, previousDurationMins: null, pendingActionById: null, pendingActionReason: null,
          status: 'CONFIRMED', rescheduleCount: { increment: 1 }, meetingUrl: lesson.meetingUrl || createMeetingUrl(), reminderSentAt: null,
        } });
        return { lesson: updated };
      }
      return { error: 'Unsupported lesson action.', status: 400 };
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    if (result.lesson?.status === 'CONFIRMED' && ['CONFIRM', 'ACCEPT_RESCHEDULE'].includes(input.action)) {
      try { await notifyLessonConfirmed(id); } catch (error) { console.error('Lesson confirmation notification failed:', error); }
    }
    return NextResponse.json({ lesson: result.lesson });
  } catch (error) {
    if (error instanceof OutsideAvailabilityError) return NextResponse.json({ error: error.message }, { status: 409 });
    reportException('lessons.update', error);
    return NextResponse.json({ error: 'Unable to update this lesson.' }, { status: 500 });
  }
}
