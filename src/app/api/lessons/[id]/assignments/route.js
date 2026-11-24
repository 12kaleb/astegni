import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { consumeRateLimit } from '../../../../../lib/rate-limit';
import { createStorageAdminClient } from '../../../../../lib/supabase/admin-storage';

export const runtime = 'nodejs';
const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = 'verification-documents';

async function getLessonForParticipant(request, context) {
  const actor = await requireUser();
  if (!actor || !['STUDENT', 'TUTOR'].includes(actor.role)) return { response: NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 }) };
  const { id } = await context.params;
  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { id: true, status: true, studentId: true, tutorId: true } });
  if (!lesson) return { response: NextResponse.json({ error: 'Lesson not found.' }, { status: 404 }) };
  if ((actor.role === 'STUDENT' && lesson.studentId !== actor.id) || (actor.role === 'TUTOR' && lesson.tutorId !== actor.id)) {
    return { response: NextResponse.json({ error: 'Access denied.' }, { status: 403 }) };
  }
  return { actor, lesson };
}

export async function GET(request, context) {
  const result = await getLessonForParticipant(request, context);
  if (result.response) return result.response;
  const storage = createStorageAdminClient();
  const assignments = await prisma.assignment.findMany({
    where: { studentId: result.lesson.studentId, tutorId: result.lesson.tutorId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, dueDate: true, status: true, score: true, maxScore: true, createdAt: true, filePath: true, fileName: true, fileSize: true },
  });
  const withLinks = await Promise.all(assignments.map(async (assignment) => {
    let fileUrl = null;
    if (assignment.filePath && storage) {
      const { data } = await storage.storage.from(BUCKET).createSignedUrl(assignment.filePath, 300);
      fileUrl = data?.signedUrl || null;
    }
    return { ...assignment, fileUrl };
  }));
  return NextResponse.json({ assignments: withLinks });
}

export async function POST(request, context) {
  const result = await getLessonForParticipant(request, context);
  if (result.response) return result.response;
  if (!['CONFIRMED', 'COMPLETED'].includes(result.lesson.status)) return NextResponse.json({ error: 'Assignments are available after the lesson is confirmed.' }, { status: 409 });
  const storage = createStorageAdminClient();
  if (!storage) return NextResponse.json({ error: 'PDF uploads are not configured.' }, { status: 503 });
  const limit = await consumeRateLimit({ scope: 'lesson-assignment-upload', identity: result.actor.id, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: 'Upload limit reached. Try again later.' }, { status: limit.unavailable ? 503 : 429 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BYTES + 64 * 1024) return NextResponse.json({ error: 'PDF files must be no larger than 8 MB.' }, { status: 413 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: 'Choose a PDF file no larger than 8 MB.' }, { status: 413 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type !== 'application/pdf' || bytes.subarray(0, 5).toString() !== '%PDF-') return NextResponse.json({ error: 'Upload a valid PDF file.' }, { status: 415 });

  const path = `lessons/${result.lesson.id}/${result.actor.id}/${randomUUID()}.pdf`;
  const { error: uploadError } = await storage.storage.from(BUCKET).upload(path, bytes, { contentType: 'application/pdf', cacheControl: '0', upsert: false });
  if (uploadError) return NextResponse.json({ error: 'Unable to save the PDF. Check storage configuration.' }, { status: 503 });
  try {
    const assignment = await prisma.assignment.create({
      data: {
        title: file.name.slice(0, 150) || 'Lesson PDF',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        studentId: result.lesson.studentId,
        tutorId: result.lesson.tutorId,
        status: 'PENDING',
        filePath: path,
        fileName: file.name.slice(0, 255),
        fileSize: file.size,
      },
      select: { id: true, title: true, dueDate: true, status: true, createdAt: true, fileName: true, fileSize: true },
    });
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    await storage.storage.from(BUCKET).remove([path]);
    console.error('Lesson PDF record creation failed:', error);
    return NextResponse.json({ error: 'Unable to add this PDF to assignments.' }, { status: 500 });
  }
}
