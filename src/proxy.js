import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function requiresSession(pathname) {
  const protectedRoots = [
    '/dashboard',
    '/account',
    '/api/account',
    '/api/admin',
    '/api/manager',
    '/api/team',
    '/api/students',
    '/api/auth/profile',
    '/api/invitations/accept',
    '/api/tutors/profile',
    '/api/tutors/lessons',
    '/api/tutors/assignments',
    '/api/tutors/verification-documents',
    '/api/tutors/availability',
    '/api/lessons',
    '/api/users/avatar',
    '/api/safety',
  ];
  return protectedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

function copyCookies(from, to) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const pathIsProtected = requiresSession(request.nextUrl.pathname);
  let claims = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (!error) claims = data?.claims || null;
  } catch (error) {
    console.error('[proxy] session verification failed:', error);
    // Fail closed for protected paths when session verification cannot complete.
  }

  if (pathIsProtected && !claims) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const result = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return copyCookies(response, result);
    }

    const destination = new URL('/', request.url);
    destination.searchParams.set('auth', 'signin');
    const result = NextResponse.redirect(destination);
    return copyCookies(response, result);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
