import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../../lib/rate-limit';

async function getPair(actor, tutorId, request) {
  const studentId = new URL(request.url).searchParams.get('studentId') || (actor?.role === 'STUDENT' ? actor.id : null);
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role) || !studentId || (actor.role === 'TUTOR' && actor.id !== tutorId) || (actor.role === 'STUDENT' && actor.id !== studentId)) return null;
  const [selection, lesson, block] = await Promise.all([
    prisma.tutorSelection.findUnique({ where: { studentId_tutorId: { studentId, tutorId } }, select: { studentId: true } }),
    prisma.lesson.findFirst({ where: { studentId, tutorId }, select: { id: true } }),
    prisma.userBlock.findFirst({ where: { OR: [{ blockerId: studentId, blockedId: tutorId }, { blockerId: tutorId, blockedId: studentId }] }, select: { blockerId: true } }),
  ]);
  return !block && (selection || lesson) ? studentId : null;
}

export async function GET(request, context) {
  try {
    const actor = await requireUser();
    const { tutorId } = await context.params;
    const studentId = await getPair(actor, tutorId, request);
    if (!studentId) return NextResponse.json({ error: 'This student curriculum is unavailable.' }, { status: 403 });
    const items = await prisma.studentCurriculumItem.findMany({ where: { studentId, tutorId }, orderBy: { createdAt: 'asc' }, select: { id: true, text: true, done: true, createdAt: true } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Student curriculum load failed:', error);
    return NextResponse.json({ error: 'Unable to load the student curriculum.' }, { status: 500 });
  }
}

export async function POST(request, context) {
  const actor = await requireUser('TUTOR');
  if (!actor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const { tutorId } = await context.params;
  const studentId = await getPair(actor, tutorId, request);
  if (!studentId) return NextResponse.json({ error: 'This student curriculum is unavailable.' }, { status: 403 });
  const limit = await consumeRateLimit({ scope: 'student-curriculum', identity: actor.id, limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return rateLimitExceededResponse(limit, 'Too many curriculum updates. Try again later.');
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 500) return NextResponse.json({ error: 'Enter a lesson topic up to 500 characters.' }, { status: 400 });
  const item = await prisma.studentCurriculumItem.create({ data: { studentId, tutorId, text }, select: { id: true, text: true, done: true, createdAt: true } });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request, context) {
  const actor = await requireUser('TUTOR');
  if (!actor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const { tutorId } = await context.params;
  const studentId = await getPair(actor, tutorId, request);
  if (!studentId) return NextResponse.json({ error: 'This student curriculum is unavailable.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== 'string' || typeof body?.done !== 'boolean') return NextResponse.json({ error: 'Choose a curriculum item and completion status.' }, { status: 400 });
  const updated = await prisma.studentCurriculumItem.updateMany({ where: { id: body.id, studentId, tutorId }, data: { done: body.done } });
  if (!updated.count) return NextResponse.json({ error: 'Curriculum item not found.' }, { status: 404 });
  return NextResponse.json({ updated: true });
}
