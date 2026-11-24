import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { createClient } from '../../../../lib/supabase/server';
import { consumeRateLimit, getClientIp } from '../../../../lib/rate-limit';
import { signupSchema, validationMessage } from '../../../../lib/validation';
import { reportException } from '../../../../lib/observability';

function limitedResponse(result) {
  const response = NextResponse.json(
    { error: result.unavailable ? 'Signup is temporarily unavailable.' : 'Too many signup attempts. Try again later.' },
    { status: result.unavailable ? 503 : 429 }
  );
  response.headers.set('Retry-After', String(result.retryAfterSeconds));
  return response;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const validation = signupSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  }

  const signup = validation.data;
  const limits = await Promise.all([
    consumeRateLimit({ scope: 'signup-ip', identity: getClientIp(request), limit: 10, windowMs: 10 * 60 * 1000 }),
    consumeRateLimit({ scope: 'signup-email', identity: signup.email.toLowerCase(), limit: 4, windowMs: 60 * 60 * 1000 }),
  ]);
  const blocked = limits.find((result) => !result.allowed);
  if (blocked) return limitedResponse(blocked);

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email: signup.email.toLowerCase(),
      password: signup.password,
      options: {
        emailRedirectTo: new URL('/auth/confirm', origin).toString(),
        data: {
          full_name: signup.name,
          phone: signup.phone,
          requested_role: signup.role,
          grade_level: signup.gradeLevel || 'Grade 11',
          is_minor: Boolean(signup.isMinor),
          guardian_name: signup.guardianName || null,
          guardian_email: signup.guardianEmail?.toLowerCase() || null,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let applicationUserId = null;
    if (data.session && data.user?.email) {
      const profileData = {
        supabaseAuthId: data.user.id,
        email: data.user.email,
        name: signup.name,
        phone: signup.phone,
        role: signup.role === 'tutor' ? 'TUTOR' : 'STUDENT',
        isMinor: Boolean(signup.isMinor),
      };
      if (signup.role === 'tutor') profileData.tutorProfile = { create: { subjects: [] } };
      if (signup.isMinor) {
        profileData.guardianConsent = { create: {
          guardianName: signup.guardianName,
          guardianEmail: signup.guardianEmail.toLowerCase(),
          policyVersion: '2026-11-14',
        } };
      }

      const applicationUser = await prisma.user.upsert({
        where: { supabaseAuthId: data.user.id },
        create: profileData,
        update: { email: data.user.email, name: signup.name, phone: signup.phone },
        select: { id: true },
      });
      applicationUserId = applicationUser.id;
    }

    return NextResponse.json({
      name: signup.name,
      id: applicationUserId,
      role: signup.role,
      hasSession: Boolean(data.session),
      confirmationRequired: !data.session,
    }, { status: 201 });
  } catch (error) {
    reportException('auth.signup', error);
    return NextResponse.json({ error: 'Unable to create your account right now.' }, { status: 500 });
  }
}
