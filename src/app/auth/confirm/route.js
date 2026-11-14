import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextPath = url.searchParams.get('next');
  const destination = nextPath?.startsWith('/') && !nextPath.startsWith('//')
    ? new URL(nextPath, url.origin)
    : new URL('/', url.origin);

  if (!code) {
    destination.searchParams.set('auth', 'signin');
    destination.searchParams.set('error', 'confirmation');
    return NextResponse.redirect(destination);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      destination.searchParams.set('auth', 'signin');
      destination.searchParams.set('error', 'confirmation');
    }
  } catch (error) {
    console.error('Auth confirmation failed:', error);
    destination.searchParams.set('auth', 'signin');
    destination.searchParams.set('error', 'confirmation');
  }

  return NextResponse.redirect(destination);
}
