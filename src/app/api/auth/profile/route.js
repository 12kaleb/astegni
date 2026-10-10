import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createClient } from '../../../../lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.email) {
    return NextResponse.json(
      { error: 'An email address is required.' },
      { status: 400 }
    );
  }

  const metadataName = user.user_metadata?.full_name;
  const name =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : user.email;

  // Treat the registration choice as a request and allow only these two roles.
  const role =
    user.user_metadata?.requested_role === 'tutor' ? 'TUTOR' : 'STUDENT';

  const createData = {
    supabaseAuthId: user.id,
    email: user.email,
    name,
    role,
  };

  if (role === 'TUTOR') {
    createData.tutorProfile = {
      create: { subjects: [] },
    };
  }

  try {
    const profile = await prisma.user.upsert({
      where: { supabaseAuthId: user.id },
      create: createData,
      // Keep the stored role authoritative after the profile is first created.
      update: { email: user.email, name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load your profile.' },
      { status: 500 }
    );
  }
}