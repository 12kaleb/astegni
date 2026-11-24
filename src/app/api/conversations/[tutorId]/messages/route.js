import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../../lib/rate-limit';

async function authorizePair(actor, tutorId, studentId) {
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) return false;
  if (!studentId || (actor.role === 'TUTOR' && actor.id !== tutorId) || (actor.role === 'STUDENT' && actor.id !== studentId)) return false;
  const [selection, lesson, block] = await Promise.all([
    prisma.tutorSelection.findUnique({ where: { studentId_tutorId: { studentId, tutorId } }, select: { studentId: true } }),
    prisma.lesson.findFirst({ where: { studentId, tutorId }, select: { id: true } }),
    prisma.userBlock.findFirst({ where: { OR: [{ blockerId: studentId, blockedId: tutorId }, { blockerId: tutorId, blockedId: studentId }] }, select: { blockerId: true } }),
  ]);
  return !block && Boolean(selection || lesson);
}

export async function GET(request, context) {
  const actor = await requireUser();
  const { tutorId } = await context.params;
  const studentId = new URL(request.url).searchParams.get('studentId') || (actor?.role === 'STUDENT' ? actor.id : null);
  if (!(await authorizePair(actor, tutorId, studentId))) return NextResponse.json({ error: 'This conversation is unavailable.' }, { status: 403 });
  const messages = await prisma.tutorStudentMessage.findMany({
    where: { tutorId, studentId },
    orderBy: { createdAt: 'asc' },
    take: 200,
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json({ messages: messages.map((message) => ({ id: message.id, text: message.text, createdAt: message.createdAt, authorId: message.authorId, senderRole: message.author.role.toLowerCase(), senderName: message.author.name })) });
}

export async function POST(request, context) {
  const actor = await requireUser();
  const { tutorId } = await context.params;
  const body = await request.json().catch(() => null);
  const studentId = actor?.role === 'STUDENT' ? actor.id : body?.studentId;
  if (!(await authorizePair(actor, tutorId, studentId))) return NextResponse.json({ error: 'This conversation is unavailable.' }, { status: 403 });
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 2000) return NextResponse.json({ error: 'Messages must contain 1 to 2000 characters.' }, { status: 400 });
  const limit = await consumeRateLimit({ scope: 'tutor-student-message', identity: actor.id, limit: 120, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return rateLimitExceededResponse(limit, 'Too many messages. Try again later.');
  const message = await prisma.tutorStudentMessage.create({ data: { studentId, tutorId, authorId: actor.id, text }, include: { author: { select: { name: true, role: true } } } });
  return NextResponse.json({ message: { id: message.id, text: message.text, createdAt: message.createdAt, authorId: actor.id, senderRole: message.author.role.toLowerCase(), senderName: message.author.name } }, { status: 201 });
}
