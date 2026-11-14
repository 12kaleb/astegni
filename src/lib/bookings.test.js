import { describe, expect, it, vi } from 'vitest';
import {
  BookingConflictError,
  OutsideAvailabilityError,
  canRescheduleAgain,
  hasLessonConflict,
  isWithinCancellationWindow,
  requireAvailableSlot,
} from './bookings';

const scheduledAt = new Date('2026-11-16T09:00:00.000Z'); // Monday, 09:00 UTC

function lesson(overrides = {}) {
  return {
    id: 'lesson-1',
    scheduledAt: new Date('2026-11-16T09:30:00.000Z'),
    durationMins: 60,
    previousScheduledAt: null,
    previousDurationMins: null,
    studentId: 'student-1',
    tutorId: 'tutor-1',
    ...overrides,
  };
}

function conflictTx(lessons) {
  return { lesson: { findMany: vi.fn().mockResolvedValue(lessons) } };
}

describe('requireAvailableSlot', () => {
  it('accepts a requested lesson fully contained in a published slot', async () => {
    const tx = { availability: { findMany: vi.fn().mockResolvedValue([{ startMinute: 540, endMinute: 660 }]) } };

    await expect(requireAvailableSlot(tx, 'tutor-1', scheduledAt, 60, 'UTC')).resolves.toBeUndefined();
    expect(tx.availability.findMany).toHaveBeenCalledWith({
      where: { tutorId: 'tutor-1', weekday: 1 },
      select: { startMinute: true, endMinute: true },
    });
  });

  it('rejects lessons that extend beyond published availability with a typed error', async () => {
    const tx = { availability: { findMany: vi.fn().mockResolvedValue([{ startMinute: 540, endMinute: 600 }]) } };

    await expect(requireAvailableSlot(tx, 'tutor-1', scheduledAt, 61, 'UTC')).rejects.toBeInstanceOf(OutsideAvailabilityError);
  });

  it('uses the tutor’s local weekday for a slot shortly after midnight in Addis Ababa', async () => {
    const shortlyAfterMidnightUtc = new Date('2026-11-16T21:30:00.000Z');
    const tx = { availability: { findMany: vi.fn().mockResolvedValue([{ startMinute: 30, endMinute: 90 }]) } };

    await expect(requireAvailableSlot(tx, 'tutor-1', shortlyAfterMidnightUtc, 60, 'Africa/Addis_Ababa')).resolves.toBeUndefined();
    expect(tx.availability.findMany).toHaveBeenCalledWith({
      where: { tutorId: 'tutor-1', weekday: 2 },
      select: { startMinute: true, endMinute: true },
    });
  });
});

describe('hasLessonConflict', () => {
  const request = { studentId: 'student-1', tutorId: 'tutor-1', scheduledAt, durationMins: 60 };

  it('detects overlapping lessons for either participant', async () => {
    const tx = conflictTx([lesson()]);

    await expect(hasLessonConflict(tx, request)).resolves.toBe(true);
  });

  it('allows lessons that only touch at the boundary', async () => {
    const tx = conflictTx([lesson({ scheduledAt: new Date('2026-11-16T10:00:00.000Z') })]);

    await expect(hasLessonConflict(tx, request)).resolves.toBe(false);
  });

  it('ignores overlapping lessons when neither participant matches', async () => {
    const tx = conflictTx([lesson({ studentId: 'other-student', tutorId: 'other-tutor' })]);

    await expect(hasLessonConflict(tx, request)).resolves.toBe(false);
  });

  it('detects conflicts with a pending reschedule’s previous time', async () => {
    const tx = conflictTx([lesson({
      scheduledAt: new Date('2026-11-17T09:00:00.000Z'),
      previousScheduledAt: new Date('2026-11-16T09:30:00.000Z'),
      previousDurationMins: 60,
    })]);

    await expect(hasLessonConflict(tx, request)).resolves.toBe(true);
  });

  it('excludes the lesson being updated from the conflict query', async () => {
    const tx = conflictTx([]);

    await expect(hasLessonConflict(tx, { ...request, excludeId: 'lesson-1' })).resolves.toBe(false);
    expect(tx.lesson.findMany.mock.calls[0][0].where.id).toEqual({ not: 'lesson-1' });
  });
});

describe('BookingConflictError', () => {
  it('has a stable code independent of its message', () => {
    expect(new BookingConflictError('wording can change').code).toBe('BOOKING_CONFLICT');
  });
});

describe('booking change limits', () => {
  const now = new Date('2026-11-16T09:00:00.000Z').getTime();

  it('blocks cancellation inside 24 hours and allows it at the exact boundary', () => {
    expect(isWithinCancellationWindow(new Date(now + 23 * 60 * 60 * 1000 + 59 * 60 * 1000), now)).toBe(true);
    expect(isWithinCancellationWindow(new Date(now + 24 * 60 * 60 * 1000), now)).toBe(false);
    expect(isWithinCancellationWindow(new Date(now - 1), now)).toBe(true);
  });

  it('allows up to three completed reschedules and blocks another', () => {
    expect(canRescheduleAgain(2)).toBe(true);
    expect(canRescheduleAgain(3)).toBe(false);
  });
});
