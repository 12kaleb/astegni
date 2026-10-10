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

    if (!appUser || appUser.role !== 'STUDENT') {
      return Response.json(
        { error: 'Student access required' },
        { status: 403 }
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        studentId: appUser.id,
        scheduledAt: { gte: new Date() },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        title: true,
        topic: true,
        scheduledAt: true,
        durationMins: true,
        status: true,
        meetingUrl: true,
        tutor: {
          select: { name: true },
        },
      },
    });

    return Response.json({ lesson });
  } catch {
    return Response.json(
      { error: 'Unable to load your next lesson.' },
      { status: 500 }
    );
  }
}