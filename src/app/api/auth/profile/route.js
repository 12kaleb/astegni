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
  const metadataPhone = user.user_metadata?.phone;
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
    phone: typeof metadataPhone === 'string' ? metadataPhone.trim().slice(0, 24) : null,
    isMinor: Boolean(user.user_metadata?.is_minor),
  };

  if (role === 'TUTOR') {
    createData.tutorProfile = {
      create: { subjects: [] },
    };
  }
  const guardianName = user.user_metadata?.guardian_name;
  const guardianEmail = user.user_metadata?.guardian_email;
  if (role === 'STUDENT' && createData.isMinor && typeof guardianName === 'string' && typeof guardianEmail === 'string') {
    createData.guardianConsent = { create: {
      guardianName: guardianName.trim().slice(0, 120),
      guardianEmail: guardianEmail.trim().toLowerCase().slice(0, 254),
      policyVersion: '2026-11-14',
    } };
  }

  try {
    const profile = await prisma.user.upsert({
      where: { supabaseAuthId: user.id },
      create: createData,
      // Keep the stored role authoritative after the profile is first created.
      update: {
        email: user.email,
        name,
        ...(typeof metadataPhone === 'string' ? { phone: metadataPhone.trim().slice(0, 24) } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        timeZone: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile sync failed:', error);
    return NextResponse.json(
      { error: 'Unable to load your profile.' },
      { status: 500 }
    );
  }
}
