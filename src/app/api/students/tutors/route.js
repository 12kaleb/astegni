import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { tutorSelectionSchema, validationMessage } from '../../../../lib/validation';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../lib/rate-limit';

export async function GET() {
  try {
    const student = await requireUser('STUDENT');
    if (!student) {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    const [selections, blocks] = await Promise.all([
      prisma.tutorSelection.findMany({
        where: { studentId: student.id },
        select: { tutor: { select: { id: true, tutorProfile: { select: { id: true } } } } },
      }),
      prisma.userBlock.findMany({ where: { OR: [{ blockerId: student.id }, { blockedId: student.id }] }, select: { blockerId: true, blockedId: true } }),
    ]);
    const blockedUserIds = new Set(blocks.map((block) => block.blockerId === student.id ? block.blockedId : block.blockerId));

    return NextResponse.json({
      tutorIds: selections.filter((selection) => !blockedUserIds.has(selection.tutor.id)).map((selection) => selection.tutor.tutorProfile?.id).filter(Boolean),
    });
  } catch (error) {
    console.error('Failed to load selected tutors:', error);
    return NextResponse.json({ error: 'Unable to load selected tutors.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const student = await requireUser('STUDENT');
    if (!student) {
      return NextResponse.json({ error: 'Sign in with a student account to select a tutor.' }, { status: 403 });
    }

    const rate = await consumeRateLimit({ scope: 'student-tutor-selection', identity: student.id, limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many tutor selection changes. Try again later.');

    const studentAccount = await prisma.user.findUnique({ where: { id: student.id }, select: { isMinor: true } });
    if (studentAccount?.isMinor) {
      const consent = await prisma.guardianConsent.findUnique({ where: { studentId: student.id }, select: { status: true } });
      if (consent?.status !== 'APPROVED') return NextResponse.json({ error: 'A parent or guardian must complete consent review before selecting a tutor.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = tutorSelectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const tutorId = validation.data.tutorId;

    const tutor = await prisma.tutorProfile.findFirst({
      where: { id: tutorId, isVerified: true, openForStudents: true },
      select: { userId: true },
    });
    if (!tutor) {
      return NextResponse.json({ error: 'This tutor is not currently available for selection.' }, { status: 404 });
    }

    const blocked = await prisma.userBlock.findFirst({
      where: { OR: [
        { blockerId: student.id, blockedId: tutor.userId },
        { blockerId: tutor.userId, blockedId: student.id },
      ] },
      select: { blockerId: true },
    });
    if (blocked) return NextResponse.json({ error: 'This interaction is unavailable.' }, { status: 403 });

    await prisma.tutorSelection.upsert({
      where: { studentId_tutorId: { studentId: student.id, tutorId: tutor.userId } },
      create: { studentId: student.id, tutorId: tutor.userId },
      update: {},
    });

    return NextResponse.json({ selected: true, tutorId });
  } catch (error) {
    console.error('Failed to select tutor:', error);
    return NextResponse.json({ error: 'Unable to select tutor.' }, { status: 500 });
  }
}
