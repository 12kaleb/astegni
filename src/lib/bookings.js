const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export class BookingConflictError extends Error {
  constructor(message = 'A participant already has a lesson during that time.') {
    super(message);
    this.name = 'BookingConflictError';
    this.code = 'BOOKING_CONFLICT';
  }
}

export class OutsideAvailabilityError extends Error {
  constructor() {
    super('The requested time is outside this tutor’s published availability.');
    this.name = 'OutsideAvailabilityError';
    this.code = 'OUTSIDE_AVAILABILITY';
  }
}

export class GuardianConsentRequiredError extends Error {
  constructor() {
    super('Parent or guardian consent must be approved before booking.');
    this.name = 'GuardianConsentRequiredError';
    this.code = 'GUARDIAN_CONSENT_REQUIRED';
  }
}

export function isValidTimeZone(timeZone) {
  try { new Intl.DateTimeFormat('en-US', { timeZone }); return true; } catch (error) {
    console.warn('[bookings] invalid time zone:', error.message);
    return false;
  }
}

function localParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { weekday: WEEKDAY_INDEX[values.weekday], minute: Number(values.hour) * 60 + Number(values.minute) };
}

export async function requireAvailableSlot(tx, tutorId, scheduledAt, durationMins, timeZone) {
  const { weekday, minute } = localParts(scheduledAt, timeZone);
  const slots = await tx.availability.findMany({ where: { tutorId, weekday }, select: { startMinute: true, endMinute: true } });
  if (!slots.some((slot) => minute >= slot.startMinute && minute + durationMins <= slot.endMinute)) {
    throw new OutsideAvailabilityError();
  }
}

export async function lockBookingParticipants(tx, participantIds) {
  const keys = [...new Set(participantIds)].sort().map((id) => `lesson:${id}`);
  if (keys.length === 1) keys.push(`${keys[0]}:secondary`);
  for (const key of keys) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  }
}

export async function hasLessonConflict(tx, { studentId, tutorId, scheduledAt, durationMins, excludeId }) {
  const endsAt = new Date(scheduledAt.getTime() + durationMins * 60_000);
  const lookback = new Date(scheduledAt.getTime() - 240 * 60_000);
  const candidates = await tx.lesson.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      AND: [
        { OR: [{ tutorId }, { studentId }] },
        { OR: [{ scheduledAt: { gte: lookback, lt: endsAt } }, { previousScheduledAt: { gte: lookback, lt: endsAt } }] },
      ],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, scheduledAt: true, durationMins: true, previousScheduledAt: true, previousDurationMins: true, studentId: true, tutorId: true },
  });
  return candidates.some((lesson) => {
    if (lesson.tutorId !== tutorId && lesson.studentId !== studentId) return false;
    const proposedEnd = lesson.scheduledAt.getTime() + lesson.durationMins * 60_000;
    const proposedOverlap = lesson.scheduledAt < endsAt && proposedEnd > scheduledAt;
    const previousEnd = lesson.previousScheduledAt
      ? lesson.previousScheduledAt.getTime() + (lesson.previousDurationMins || lesson.durationMins) * 60_000
      : 0;
    const previousOverlap = lesson.previousScheduledAt && lesson.previousScheduledAt < endsAt && previousEnd > scheduledAt;
    return proposedOverlap || previousOverlap;
  });
}
