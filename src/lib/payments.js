import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from './prisma';

export function safeSignatureEquals(expected, received) {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyChapaWebhookSignature(rawBody, headers) {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  if (!secret) return false;
  let canonicalBody = rawBody;
  try { canonicalBody = JSON.stringify(JSON.parse(rawBody)); } catch { return false; }
  const payloadSignatures = [rawBody, canonicalBody].map((body) => createHmac('sha256', secret).update(body).digest('hex'));
  const secretSignature = createHmac('sha256', secret).update(secret).digest('hex');
  return payloadSignatures.some((signature) => safeSignatureEquals(signature, headers.get('x-chapa-signature')))
    || safeSignatureEquals(secretSignature, headers.get('chapa-signature'));
}

export function verifyStripeWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const pieces = signatureHeader.split(',').map((piece) => piece.split('='));
  const timestamp = pieces.find(([key]) => key === 't')?.[1];
  const signatures = pieces.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !Number.isInteger(Number(timestamp)) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some((signature) => safeSignatureEquals(expected, signature));
}

export async function verifyAndApplyChapaPayment(providerReference) {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) throw new Error('Chapa is not configured.');
  const payment = await prisma.payment.findFirst({ where: { provider: 'CHAPA', providerReference } });
  if (!payment) return { ok: false, reason: 'payment_not_found' };

  const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(providerReference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) return { ok: false, reason: 'verification_failed' };
  const responseBody = await response.json();
  const transaction = responseBody.data;
  if (responseBody.status !== 'success' || transaction?.status !== 'success') return { ok: false, reason: 'not_paid' };
  if (transaction.tx_ref !== providerReference || transaction.currency !== payment.currency
    || Math.round(Number(transaction.amount) * 100) !== payment.amountMinor) {
    return { ok: false, reason: 'payment_mismatch' };
  }

  await prisma.payment.updateMany({
    where: { id: payment.id, status: 'PENDING' },
    data: { status: 'PAID', paidAt: new Date(), providerPaymentId: transaction.reference || null },
  });
  return { ok: true, paymentId: payment.id };
}

export async function applyStripeCheckoutEvent(event) {
  const session = event.data?.object;
  const paymentId = session?.metadata?.paymentId;
  if (!paymentId) return { ok: true, ignored: true };
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, provider: 'STRIPE' } });
  if (!payment) return { ok: false, reason: 'payment_not_found' };

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (session.payment_status !== 'paid' || session.currency?.toUpperCase() !== payment.currency
      || session.amount_total !== payment.amountMinor) return { ok: false, reason: 'payment_mismatch' };
    await prisma.payment.updateMany({
      where: { id: payment.id, status: 'PENDING' },
      data: { status: 'PAID', paidAt: new Date(), providerPaymentId: session.id },
    });
  } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
    await prisma.payment.updateMany({ where: { id: payment.id, status: 'PENDING' }, data: { status: 'FAILED' } });
  }
  return { ok: true };
}
