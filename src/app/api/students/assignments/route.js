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

    const assignments = await prisma.assignment.findMany({
      where: { studentId: appUser.id },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true,
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