import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireUser } from '../../../../../../lib/auth';
import { createStorageAdminClient } from '../../../../../../lib/supabase/admin-storage';

const BUCKET = 'verification-documents';

export async function GET(_request, context) {
  try {
    const student = await requireUser('STUDENT');
    if (!student) return NextResponse.json({ error: 'Student access required.' }, { status: 403 });

    const { tutorId } = await context.params;
    const [selection, lessons, blocked] = await Promise.all([
      prisma.tutorSelection.findUnique({ where: { studentId_tutorId: { studentId: student.id, tutorId } }, select: { studentId: true } }),
      prisma.lesson.findMany({
        where: { studentId: student.id, tutorId },
        orderBy: { scheduledAt: 'desc' },
        select: { id: true, title: true, topic: true, scheduledAt: true, durationMins: true, status: true, meetingUrl: true },
      }),
      prisma.userBlock.findFirst({ where: { OR: [{ blockerId: student.id, blockedId: tutorId }, { blockerId: tutorId, blockedId: student.id }] }, select: { blockerId: true } }),
    ]);
    if (blocked || (!selection && !lessons.length)) return NextResponse.json({ error: 'This tutor workspace is unavailable.' }, { status: 404 });

    const [tutor, curriculum, assignments] = await Promise.all([
      prisma.user.findUnique({ where: { id: tutorId }, select: { id: true, name: true, avatarUrl: true, tutorProfile: { select: { title: true, subjects: true, bio: true } } } }),
      prisma.studentCurriculumItem.findMany({ where: { studentId: student.id, tutorId }, orderBy: { createdAt: 'asc' }, select: { id: true, text: true, done: true } }),
      prisma.assignment.findMany({ where: { studentId: student.id, tutorId }, orderBy: { dueDate: 'asc' }, select: { id: true, title: true, dueDate: true, status: true, score: true, maxScore: true, filePath: true, fileName: true } }),
    ]);
    if (!tutor) return NextResponse.json({ error: 'Tutor not found.' }, { status: 404 });

    const storage = createStorageAdminClient();
    const assignmentsWithLinks = await Promise.all(assignments.map(async (assignment) => {
      let fileUrl = null;
      if (assignment.filePath && storage) {
        const { data } = await storage.storage.from(BUCKET).createSignedUrl(assignment.filePath, 300);
        fileUrl = data?.signedUrl || null;
      }
      return { ...assignment, fileUrl };
    }));

    return NextResponse.json({ tutor, lessons, curriculum, assignments: assignmentsWithLinks });
  } catch (error) {
    console.error('Failed to load student tutor workspace:', error);
    return NextResponse.json({ error: 'Unable to load this tutor workspace.' }, { status: 500 });
  }
}
