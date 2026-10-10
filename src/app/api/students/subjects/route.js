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