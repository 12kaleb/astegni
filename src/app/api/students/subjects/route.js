import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { subjectProgressCreateSchema, validationMessage } from '../../../../lib/validation';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../lib/rate-limit';

export async function GET() {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const subjects = await prisma.subjectProgress.findMany({
      where: { studentId: appUser.id },
      orderBy: { subjectName: 'asc' },
      select: {
        id: true,
        subjectName: true,
        topic: true,
        progressPct: true,
      },
    });

    return Response.json({ subjects });
  } catch {
    return Response.json(
      { error: 'Unable to load subjects.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const rate = await consumeRateLimit({ scope: 'student-subjects', identity: appUser.id, limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many subject changes. Try again later.');

    const body = await request.json().catch(() => null);
    const validation = subjectProgressCreateSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { subjectName, topic, progressPct } = validation.data;

    const newSubject = await prisma.subjectProgress.create({
      data: {
        subjectName,
        topic: topic || 'Foundations & Exam Review',
        progressPct: typeof progressPct === 'number' ? progressPct : 0,
        studentId: appUser.id,
      },
    });

    return Response.json({ subject: newSubject });
  } catch {
    return Response.json(
      { error: 'Unable to add subject.' },
      { status: 500 }
    );
  }
}
