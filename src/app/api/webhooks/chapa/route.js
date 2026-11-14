import { NextResponse } from 'next/server';
import { verifyAndApplyChapaPayment, verifyChapaWebhookSignature } from '../../../../lib/payments';

export async function POST(request) {
  const rawBody = await request.text();
  if (!verifyChapaWebhookSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }
  let event;
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }); }
  const reference = event.data?.tx_ref || event.tx_ref || event.trx_ref;
  if (!reference) return NextResponse.json({ received: true, ignored: true });

  try {
    const result = await verifyAndApplyChapaPayment(reference);
    if (result.reason === 'payment_mismatch') return NextResponse.json({ error: 'Verified transaction does not match the payment record.' }, { status: 409 });
    return NextResponse.json({ received: true, applied: result.ok });
  } catch (error) {
    console.error('Chapa webhook verification failed:', error);
    return NextResponse.json({ error: 'Unable to verify transaction.' }, { status: 502 });
  }
}
