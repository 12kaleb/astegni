import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export async function GET() {
  const student = await requireUser('STUDENT');
  if (!student) return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const lessons = await prisma.lesson.findMany({
    where: { studentId: student.id, status: 'COMPLETED', review: null },
    orderBy: { scheduledAt: 'desc' },
    take: 20,
    select: { id: true, title: true, scheduledAt: true, tutor: { select: { name: true } } },
  });
  return NextResponse.json({ lessons });
}
