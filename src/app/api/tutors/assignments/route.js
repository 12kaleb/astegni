import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import {
  tutorAssignmentCreateSchema,
  tutorAssignmentUpdateSchema,
  validationMessage,
} from '../../../../lib/validation';

export async function GET() {
  try {
    const tutor = await requireUser('TUTOR');

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { tutorId: tutor.id },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        score: true,
        maxScore: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Failed to load tutor assignments:', error);
    return NextResponse.json({ error: 'Unable to load assignments.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tutor = await requireUser('TUTOR');

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = tutorAssignmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { studentId, title, dueDate, maxScore = 10 } = validation.data;

    const student = await prisma.user.findFirst({
      where: { id: studentId, role: 'STUDENT' },
      select: { id: true, name: true, isMinor: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const [block, selection, lesson, consent] = await Promise.all([
      prisma.userBlock.findFirst({ where: { OR: [{ blockerId: student.id, blockedId: tutor.id }, { blockerId: tutor.id, blockedId: student.id }] }, select: { blockerId: true } }),
      prisma.tutorSelection.findUnique({ where: { studentId_tutorId: { studentId: student.id, tutorId: tutor.id } }, select: { studentId: true } }),
      prisma.lesson.findFirst({ where: { studentId: student.id, tutorId: tutor.id }, select: { id: true } }),
      student.isMinor ? prisma.guardianConsent.findUnique({ where: { studentId: student.id }, select: { status: true } }) : Promise.resolve(null),
    ]);
    if (block) return NextResponse.json({ error: 'This interaction is unavailable.' }, { status: 403 });
    if (!selection && !lesson) return NextResponse.json({ error: 'The student must select you before you can assign work.' }, { status: 403 });
    if (student.isMinor && consent?.status !== 'APPROVED') return NextResponse.json({ error: 'Parent or guardian consent must be approved before assigning work.' }, { status: 403 });

    const assignment = await prisma.assignment.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000 * 3),
        studentId: student.id,
        tutorId: tutor.id,
        maxScore,
        status: 'PENDING',
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        score: true,
        maxScore: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json({ error: 'Unable to create assignment.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const tutor = await requireUser('TUTOR');

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = tutorAssignmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const data = validation.data;

    const assignment = await prisma.assignment.findFirst({
      where: { id: data.id, tutorId: tutor.id },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const dataToUpdate = {};
    if (data.score !== undefined) dataToUpdate.score = data.score;
    if (data.maxScore !== undefined) dataToUpdate.maxScore = data.maxScore;
    if (data.status !== undefined) dataToUpdate.status = data.status;
    if (data.title !== undefined) dataToUpdate.title = data.title;

    const updated = await prisma.assignment.update({
      where: { id: data.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error('Failed to update assignment:', error);
    return NextResponse.json({ error: 'Unable to update assignment.' }, { status: 500 });
  }
}
