import { z } from 'zod';

const calendarDateTime = z.string()
  .max(40)
  .regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/)
  .refine((value) => Number.isFinite(Date.parse(value)), 'Enter a valid date and time.');

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'tutor']),
  gradeLevel: z.string().trim().max(40).optional(),
  isMinor: z.boolean().optional(),
  guardianName: z.string().trim().min(2).max(120).optional(),
  guardianEmail: z.string().trim().email().max(254).optional(),
}).strict().refine((value) => !value.isMinor || (value.role === 'student' && value.guardianName && value.guardianEmail), {
  message: 'Students under 18 must provide parent or guardian contact details.',
});

export const safetyReportSchema = z.object({
  reportedUserId: z.string().trim().min(1).max(64),
  category: z.enum(['HARASSMENT', 'SAFETY', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'OTHER']),
  details: z.string().trim().min(10).max(3000),
}).strict();

export const blockUserSchema = z.object({
  userId: z.string().trim().min(1).max(64),
}).strict();

export const verificationReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().trim().max(1000).optional(),
}).strict();

export const reportReviewSchema = z.object({
  reportId: z.string().trim().min(1).max(64),
  status: z.enum(['REVIEWING', 'RESOLVED', 'DISMISSED']),
}).strict();

const timezoneSchema = z.string().trim().min(3).max(64).refine((timeZone) => {
  try { new Intl.DateTimeFormat('en-US', { timeZone }); return true; } catch (error) {
    console.warn('[validation] invalid time zone:', error.message);
    return false;
  }
}, 'Enter a valid IANA time zone.');

const bookingDateTime = z.string().max(40)
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/)
  .refine((value) => Number.isFinite(Date.parse(value)), 'Enter a valid date and time with a time zone.');

export const availabilitySchema = z.object({
  timeZone: timezoneSchema,
  slots: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  }).strict().refine((slot) => slot.startTime < slot.endTime, 'End time must be after start time.')).max(28),
}).strict().refine(({ slots }) => {
  const values = slots.map((slot) => ({ day: slot.weekday, start: slot.startTime, end: slot.endTime }));
  if (new Set(values.map((slot) => `${slot.day}-${slot.start}-${slot.end}`)).size !== values.length) return false;
  return values.every((slot, index) => values.slice(index + 1).every((other) => slot.day !== other.day || slot.end <= other.start || other.end <= slot.start));
}, 'Availability windows cannot overlap.');

export const lessonBookingSchema = z.object({
  tutorProfileId: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(160),
  topic: z.string().trim().max(300).optional(),
  scheduledAt: bookingDateTime,
  durationMins: z.number().int().min(30).max(180).multipleOf(15),
  timeZone: timezoneSchema,
}).strict();

export const lessonActionSchema = z.object({
  action: z.enum(['CONFIRM', 'DECLINE', 'CANCEL', 'RESCHEDULE', 'ACCEPT_RESCHEDULE', 'DECLINE_RESCHEDULE']),
  scheduledAt: bookingDateTime.optional(),
  durationMins: z.number().int().min(30).max(180).multipleOf(15).optional(),
  timeZone: timezoneSchema.optional(),
  reason: z.string().trim().min(5).max(1000).optional(),
}).strict().refine((value) => {
  if (value.action === 'RESCHEDULE') return Boolean(value.scheduledAt && value.durationMins && value.timeZone && value.reason);
  if (value.action === 'CANCEL') return Boolean(value.reason);
  return true;
}, 'Provide the new time and a reason for a reschedule, or a reason for cancellation.');

export const tutorProfileUpdateSchema = z.object({
  title: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(3000).optional(),
  university: z.string().trim().max(160).optional(),
  experienceYears: z.number().int().min(0).max(80).nullable().optional(),
  hourlyRateETB: z.number().int().min(0).max(1000).nullable().optional(),
  hourlyRateUSD: z.number().int().min(0).max(10000).nullable().optional(),
  openForStudents: z.boolean().optional(),
  subjects: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  modes: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  gradeLevels: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  languages: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one profile field.',
});

export const lessonReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
}).strict();

export const paymentCheckoutSchema = z.object({
  lessonId: z.string().trim().min(1).max(64),
  currency: z.enum(['ETB', 'USD']),
}).strict();

export const tutorLessonCreateSchema = z.object({
  studentId: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(160),
  topic: z.string().trim().max(300).optional().nullable(),
  scheduledAt: calendarDateTime,
  durationMins: z.number().int().min(15).max(240).optional(),
  meetingUrl: z.string().url().max(2048).refine((value) => value.startsWith('https://'), 'Meeting URLs must use HTTPS.').optional().nullable(),
}).strict();

export const tutorAssignmentCreateSchema = z.object({
  studentId: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(150),
  dueDate: calendarDateTime.optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
}).strict();

export const tutorAssignmentUpdateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  score: z.number().int().min(0).max(1000).optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
  title: z.string().trim().min(1).max(150).optional(),
}).strict().refine((value) => Object.keys(value).some((key) => key !== 'id'), {
  message: 'Provide at least one assignment field to update.',
});

export const studentAssignmentCreateSchema = z.object({
  title: z.string().trim().min(1).max(150),
  dueDate: calendarDateTime.optional(),
}).strict();

export const studentAssignmentUpdateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
}).strict();

export const subjectProgressCreateSchema = z.object({
  subjectName: z.string().trim().min(1).max(120),
  topic: z.string().trim().max(160).optional(),
  progressPct: z.number().int().min(0).max(100).optional(),
}).strict();

export const ticketUpdateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  status: z.enum(['OPEN', 'RESOLVED', 'ESCALATED']).optional(),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).optional(),
  specialistId: z.string().trim().min(1).max(64).nullable().optional(),
  title: z.string().trim().min(1).max(180).optional(),
  detail: z.string().trim().min(1).max(5000).optional(),
}).strict().refine((value) => Object.keys(value).some((key) => key !== 'id'), {
  message: 'Provide at least one ticket field to update.',
});

export const approvalUpdateSchema = z.object({
  approvalId: z.string().trim().min(1).max(64),
  status: z.enum(['APPROVED', 'REJECTED']),
}).strict();

export const tutorSelectionSchema = z.object({
  tutorId: z.string().trim().min(1).max(64),
}).strict();

export const tutorVerificationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
}).strict();

export const legacyTutorVerificationSchema = z.object({
  tutorUserId: z.string().trim().min(1).max(64),
  isVerified: z.boolean(),
}).strict();

export const invitationCreateSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(['ADMIN', 'MANAGER', 'SUPPORT_SPECIALIST']),
}).strict();

export const invitationAcceptSchema = z.object({
  invitationId: z.string().trim().min(1).max(64),
}).strict();

export function validationMessage(error) {
  return error.issues.map((issue) => issue.message).join(' ');
}
