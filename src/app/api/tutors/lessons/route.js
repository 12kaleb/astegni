import { prisma } from '../../../../lib/prisma';
import { createClient } from '../../../../lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { id: true, role: true },
    });

    if (!appUser || appUser.role !== 'TUTOR') {
      return Response.json(
        { error: 'Tutor access required' },
        { status: 403 }
      );
    }

    const lessonWhere = {
        tutorId: appUser.id,
        scheduledAt: { gte: new Date() },
        status: { in: ['CONFIRMED', 'PENDING'] },
      };

    const lessons = await prisma.lesson.findMany({
      where: lessonWhere,
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      select: {
        id: true,
        title: true,
        studentId : true,
        topic: true,
        scheduledAt: true,
        durationMins: true,
        status: true,
        student: {
          select: { name: true}
        },
      },
    });

    const lessonCount = await prisma.lesson.count({
        where: lessonWhere,
      });
      const activeStudentRows = await prisma.lesson.findMany({
        where: lessonWhere,
        distinct: ['studentId'],
        select: { studentId: true },
      });
      
      const activeStudentCount = activeStudentRows.length;
      return Response.json({ lessons, lessonCount, activeStudentCount });
  } catch {
    return Response.json(
      { error: 'Unable to load lessons.' },
      { status: 500 }
    );
  }
}

