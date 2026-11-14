import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { consumeRateLimit } from '../../../../lib/rate-limit';
import { tutorProfileUpdateSchema, validationMessage } from '../../../../lib/validation';

export async function GET() {
  try {
    const appUser = await requireUser('TUTOR');

    if (!appUser) {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: appUser.id },
      select: {
        id: true,
        title: true,
        university: true,
        experienceYears: true,
        location: true,
        modes: true,
        gradeLevels: true,
        languages: true,
        subjects: true,
        hourlyRateETB: true,
        hourlyRateUSD: true,
        bio: true,
        isVerified: true,
        openForStudents: true,
        rating: true,
        reviewsCount: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        hourlyRateETB: profile.hourlyRateETB,
        user: {
          name: appUser.name,
          email: appUser.email,
          avatarUrl: appUser.avatarUrl,
          phone: appUser.phone,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load tutor profile.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const appUser = await requireUser('TUTOR');

    if (!appUser) {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const rateLimit = await consumeRateLimit({
      scope: 'tutor-profile-update',
      identity: appUser.id,
      limit: 12,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimit.unavailable ? 'Profile updates are temporarily unavailable.' : 'Too many profile updates. Try again later.' },
        { status: rateLimit.unavailable ? 503 : 429 }
      );
      response.headers.set('Retry-After', String(rateLimit.retryAfterSeconds));
      return response;
    }

    const body = await request.json().catch(() => null);
    const validation = tutorProfileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const updates = validation.data;

    const profile = await prisma.tutorProfile.update({
      where: { userId: appUser.id },
      data: updates,
      select: {
        id: true,
        title: true,
        university: true,
        experienceYears: true,
        location: true,
        modes: true,
        gradeLevels: true,
        languages: true,
        subjects: true,
        hourlyRateETB: true,
        hourlyRateUSD: true,
        bio: true,
        isVerified: true,
        openForStudents: true,
        rating: true,
        reviewsCount: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Tutor profile update failed:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
