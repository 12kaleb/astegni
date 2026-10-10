import { NextResponse } from 'next/server';
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { id: true, role: true },
    });

    if (!appUser || appUser.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
    }

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: appUser.id },
      select: {
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

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load tutor profile.' },
      { status: 500 }
    );
  }
}
export async function PATCH(request) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const appUser = await prisma.user.findUnique({
        where: { supabaseAuthId: user.id },
        select: { id: true, role: true },
      });
  
      if (!appUser || appUser.role !== 'TUTOR') {
        return NextResponse.json({ error: 'Tutor access required' }, { status: 403 });
      }
  
      const body = await request.json().catch(() => null);
  
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
  
      const allowedFields = ['title', 'location', 'bio', 'subjects'];
      if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
        return NextResponse.json({ error: 'Unsupported profile field' }, { status: 400 });
      }
  
      const updates = {};
  
      for (const [field, maxLength] of Object.entries({
        title: 120,
        location: 120,
        bio: 3000,
      })) {
        if (body[field] === undefined) continue;
  
        if (typeof body[field] !== 'string' || body[field].length > maxLength) {
          return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
        }
  
        updates[field] = body[field].trim();
      }
  
      if (body.subjects !== undefined) {
        if (
          !Array.isArray(body.subjects) ||
          body.subjects.length > 20 ||
          body.subjects.some(
            (subject) => typeof subject !== 'string' || subject.length > 80
          )
        ) {
          return NextResponse.json({ error: 'Invalid subjects' }, { status: 400 });
        }
  
        updates.subjects = body.subjects
          .map((subject) => subject.trim())
          .filter(Boolean);
      }
  
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No profile fields supplied' }, { status: 400 });
      }
  
      const profile = await prisma.tutorProfile.update({
        where: { userId: appUser.id },
        data: updates,
        select: {
          title: true,
          location: true,
          bio: true,
          subjects: true,
          isVerified: true,
          openForStudents: true,
        },
      });
  
      return NextResponse.json({ profile });
    } catch (error) {
      console.error('Auth profile upsert failed:', error);
    }
  }