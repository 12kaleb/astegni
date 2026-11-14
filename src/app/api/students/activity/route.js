import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const appUser = await requireUser('STUDENT');

    if (!appUser) {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const [lessons, assignments] = await Promise.all([
      prisma.lesson.findMany({
        where: { studentId: appUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.assignment.findMany({
        where: { studentId: appUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    const activity = [
      ...lessons.map((item) => ({
        id: `lesson-${item.id}`,
        type: 'lesson',
        title: item.title,
        createdAt: item.createdAt,
      })),
      ...assignments.map((item) => ({
        id: `assignment-${item.id}`,
        type: 'assignment',
        title: item.title,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return Response.json({ activity });
  } catch {
    return Response.json(
      { error: 'Unable to load your activity feed.' },
      { status: 500 }
    );
  }
}