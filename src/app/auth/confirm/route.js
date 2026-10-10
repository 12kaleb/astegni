import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/?auth=confirmation-error', url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL('/?auth=confirmation-error', url.origin));
  }

  return NextResponse.redirect(new URL('/?auth=confirmed', url.origin));
}