import { NextResponse } from 'next/server';
import { applyStripeCheckoutEvent, verifyStripeWebhookSignature } from '../../../../lib/payments';

export async function POST(request) {
  const rawBody = await request.text();
  if (!verifyStripeWebhookSignature(rawBody, request.headers.get('stripe-signature'))) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }); }
  try {
    const result = await applyStripeCheckoutEvent(event);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: 'Unable to process payment event.' }, { status: 500 });
  }
}
