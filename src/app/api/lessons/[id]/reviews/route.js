import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { lessonReviewSchema, validationMessage } from '../../../../../lib/validation';
import { reportException } from '../../../../../lib/observability';

export async function POST(request, context) {
  const student = await requireUser('STUDENT');
  if (!student) return NextResponse.json({ error: 'Student access required.' }, { status: 403 });

  const { id: lessonId } = await context.params;
  const body = await request.json().catch(() => null);
  const validation = lessonReviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });

  try {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, studentId: student.id, status: 'COMPLETED' },
      select: { id: true, tutorId: true },
    });
    if (!lesson) return NextResponse.json({ error: 'Only your completed lessons can be reviewed.' }, { status: 404 });

    const review = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "TutorProfile" WHERE "userId" = ${lesson.tutorId} FOR UPDATE`;
      const created = await tx.review.create({
        data: {
          lessonId,
          studentId: student.id,
          tutorId: lesson.tutorId,
          rating: validation.data.rating,
          comment: validation.data.comment || null,
        },
      });
      const aggregate = await tx.review.aggregate({ where: { tutorId: lesson.tutorId }, _avg: { rating: true }, _count: { _all: true } });
      await tx.tutorProfile.update({
        where: { userId: lesson.tutorId },
        data: { rating: aggregate._avg.rating == null ? null : Math.round(aggregate._avg.rating * 10) / 10, reviewsCount: aggregate._count._all },
      });
      return created;
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'This lesson already has a review.' }, { status: 409 });
    reportException('reviews.create', error);
    return NextResponse.json({ error: 'Unable to save your review.' }, { status: 500 });
  }
}
