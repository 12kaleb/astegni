import { NextResponse } from 'next/server';
import { verifyAndApplyChapaPayment } from '../../../../../lib/payments';

export async function GET(request) {
  const url = new URL(request.url);
  const providerReference = url.searchParams.get('tx_ref') || url.searchParams.get('trx_ref');
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || url.origin).replace(/\/$/, '');
  if (!providerReference) return NextResponse.redirect(`${origin}/dashboard?paymentStatus=failed`);

  try {
    const result = await verifyAndApplyChapaPayment(providerReference);
    const status = result.ok ? 'success' : 'pending';
    return NextResponse.redirect(`${origin}/dashboard?paymentStatus=${status}`);
  } catch (error) {
    console.error('Chapa callback verification failed:', error);
    return NextResponse.redirect(`${origin}/dashboard?paymentStatus=unverified`);
  }
}
