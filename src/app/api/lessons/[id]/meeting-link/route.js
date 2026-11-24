import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../../lib/rate-limit';

export async function PATCH(request, context) {
  const tutor = await requireUser('TUTOR');
  if (!tutor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });

  const limit = await consumeRateLimit({ scope: 'lesson-meeting-link', identity: tutor.id, limit: 20, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return rateLimitExceededResponse(limit, 'Too many meeting link changes. Try again later.');

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.meetingUrl === 'string' ? body.meetingUrl.trim() : '';
  let parsedUrl;
  try { parsedUrl = new URL(rawUrl); } catch {}
  if (!parsedUrl || parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'meet.google.com' || parsedUrl.username || parsedUrl.password) {
    return NextResponse.json({ error: 'Paste a valid Google Meet link (https://meet.google.com/…).'} , { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { id: true, tutorId: true, status: true } });
  if (!lesson || lesson.tutorId !== tutor.id) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  if (lesson.status !== 'CONFIRMED') return NextResponse.json({ error: 'Google Meet links can be added to confirmed lessons.' }, { status: 409 });

  const updated = await prisma.lesson.update({ where: { id }, data: { meetingUrl: parsedUrl.toString() }, select: { id: true, meetingUrl: true } });
  return NextResponse.json({ lesson: updated });
}
