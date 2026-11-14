import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import {
  studentAssignmentCreateSchema,
  studentAssignmentUpdateSchema,
  validationMessage,
} from '../../../../lib/validation';

export async function GET() {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const assignments = await prisma.assignment.findMany({
      where: { studentId: appUser.id },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
        score: true,
        maxScore: true,
        tutor: {
          select: { name: true },
        },
      },
    });

    return Response.json({ assignments });
  } catch {
    return Response.json(
      { error: 'Unable to load assignments.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const validation = studentAssignmentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { id, status } = validation.data;

    const assignment = await prisma.assignment.findFirst({
      where: { id, studentId: appUser.id },
    });

    if (!assignment) {
      return Response.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: { status: status || (assignment.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') },
    });

    return Response.json({ assignment: updated });
  } catch {
    return Response.json(
      { error: 'Unable to update assignment status.' },
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

    const body = await request.json().catch(() => null);
    const validation = studentAssignmentCreateSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const { title, dueDate } = validation.data;

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000 * 3),
        studentId: appUser.id,
        status: 'PENDING',
      },
    });

    return Response.json({ assignment: newAssignment });
  } catch {
    return Response.json(
      { error: 'Unable to create assignment.' },
      { status: 500 }
    );
  }
}
