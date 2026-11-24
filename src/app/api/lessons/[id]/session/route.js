import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../../lib/rate-limit';
import { lessonSessionItemCreateSchema, lessonSessionItemUpdateSchema, validationMessage } from '../../../../../lib/validation';

function isParticipant(actor, lesson) {
  return (actor.role === 'STUDENT' && lesson.studentId === actor.id)
    || (actor.role === 'TUTOR' && lesson.tutorId === actor.id);
}

export async function GET(request, context) {
  const actor = await requireUser();
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) {
    return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
  }
  const { id: lessonId } = await context.params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, studentId: true, tutorId: true, status: true, startedAt: true, completedAt: true },
  });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  if (!isParticipant(actor, lesson)) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });

  const [messages, agenda, notes] = await Promise.all([
    prisma.lessonSessionItem.findMany({ where: { lessonId, type: 'CHAT' }, orderBy: { createdAt: 'asc' }, take: 200, include: { author: { select: { name: true, role: true } } } }),
    prisma.lessonSessionItem.findMany({ where: { lessonId, type: 'AGENDA' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 100, select: { id: true, text: true, done: true } }),
    actor.role === 'TUTOR'
      ? prisma.lessonSessionItem.findMany({ where: { lessonId, type: 'NOTE', authorId: actor.id }, orderBy: { createdAt: 'asc' }, take: 100, select: { id: true, text: true, done: true } })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    status: lesson.status,
    startedAt: lesson.startedAt,
    completedAt: lesson.completedAt,
    messages: messages.map((message) => ({
      id: message.id,
      senderRole: message.author.role.toLowerCase(),
      senderName: message.author.name,
      text: message.text,
      sentAt: message.createdAt,
    })),
    agenda,
    notes,
  });
}

export async function POST(request, context) {
  const actor = await requireUser();
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) {
    return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
  }
  const rate = await consumeRateLimit({ scope: 'lesson-session-write', identity: actor.id, limit: 120, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many lesson updates. Try again later.');
  const body = await request.json().catch(() => null);
  const validation = lessonSessionItemCreateSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  const { id: lessonId } = await context.params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, studentId: true, tutorId: true, status: true } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  if (!isParticipant(actor, lesson)) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });

  const { type, text } = validation.data;
  if (type === 'NOTE' && actor.role !== 'TUTOR') return NextResponse.json({ error: 'Tutor access required for private notes.' }, { status: 403 });
  if (lesson.status !== 'CONFIRMED' && !(type === 'NOTE' && lesson.status === 'COMPLETED')) {
    return NextResponse.json({ error: 'This lesson is not open for session updates.' }, { status: 409 });
  }

  const item = await prisma.lessonSessionItem.create({ data: { lessonId, authorId: actor.id, type, text } });
  return NextResponse.json({ item: { id: item.id, type: item.type, text: item.text, done: item.done, createdAt: item.createdAt } }, { status: 201 });
}

export async function PATCH(request, context) {
  const actor = await requireUser();
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) {
    return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
  }
  const rate = await consumeRateLimit({ scope: 'lesson-session-write', identity: actor.id, limit: 120, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many lesson updates. Try again later.');
  const body = await request.json().catch(() => null);
  const validation = lessonSessionItemUpdateSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  const { id: lessonId } = await context.params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, studentId: true, tutorId: true } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  if (!isParticipant(actor, lesson)) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  if (validation.data.type === 'NOTE' && actor.role !== 'TUTOR') return NextResponse.json({ error: 'Tutor access required for private notes.' }, { status: 403 });

  const updated = await prisma.lessonSessionItem.updateMany({
    where: {
      id: validation.data.id,
      lessonId,
      type: validation.data.type,
      ...(validation.data.type === 'NOTE' ? { authorId: actor.id } : {}),
    },
    data: { done: validation.data.done },
  });
  if (!updated.count) return NextResponse.json({ error: 'Session item not found.' }, { status: 404 });
  return NextResponse.json({ updated: true });
}
