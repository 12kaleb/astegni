import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { paymentCheckoutSchema, validationMessage } from '../../../../lib/validation';
import { reportException } from '../../../../lib/observability';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../lib/rate-limit';

function publicOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function POST(request) {
  const student = await requireUser('STUDENT');
  if (!student) return NextResponse.json({ error: 'Student access required.' }, { status: 403 });
  const rate = await consumeRateLimit({ scope: 'payment-checkout', identity: student.id, limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many checkout attempts. Try again later.');
  const body = await request.json().catch(() => null);
  const validation = paymentCheckoutSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });

  const { lessonId, currency } = validation.data;
  const provider = currency === 'ETB' ? 'CHAPA' : 'STRIPE';
  if ((provider === 'CHAPA' && !process.env.CHAPA_SECRET_KEY) || (provider === 'STRIPE' && !process.env.STRIPE_SECRET_KEY)) {
    return NextResponse.json({ error: `${provider} payments are not configured.` }, { status: 503 });
  }

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, studentId: student.id, status: 'CONFIRMED' },
    select: {
      id: true, title: true, durationMins: true,
      tutor: { select: { tutorProfile: { select: { hourlyRateETB: true, hourlyRateUSD: true } } } },
    },
  });
  if (!lesson) return NextResponse.json({ error: 'Only your confirmed lessons can be paid.' }, { status: 404 });
  const hourlyRate = currency === 'ETB' ? lesson.tutor.tutorProfile?.hourlyRateETB : lesson.tutor.tutorProfile?.hourlyRateUSD;
  if (!Number.isInteger(hourlyRate) || hourlyRate <= 0) {
    return NextResponse.json({ error: `The tutor has not set a ${currency} hourly rate.` }, { status: 409 });
  }
  const amountMinor = Math.round(hourlyRate * lesson.durationMins / 60 * 100);
  const providerReference = `ast-${randomUUID()}`;
  const reservation = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Lesson" WHERE "id" = ${lessonId} FOR UPDATE`;
    const currentLesson = await tx.lesson.findFirst({ where: { id: lessonId, studentId: student.id, status: 'CONFIRMED' }, select: { id: true } });
    if (!currentLesson) return { error: 'Only your confirmed lessons can be paid.' };
    const existing = await tx.payment.findUnique({ where: { lessonId } });
    if (existing?.status === 'PAID') return { error: 'This lesson is already paid.' };
    if (existing?.status === 'PENDING') {
      if (existing.currency !== currency) return { error: 'A different currency checkout is already in progress.' };
      if (existing.checkoutUrl) return { payment: existing, reuse: true };
      return { error: 'Checkout is already being initialized. Try again shortly.' };
    }
    const payment = existing
      ? await tx.payment.update({
        where: { lessonId },
        data: { provider, status: 'PENDING', amountMinor, currency, providerReference, checkoutUrl: null, providerPaymentId: null, paidAt: null },
      })
      : await tx.payment.create({ data: { lessonId, studentId: student.id, provider, amountMinor, currency, providerReference } });
    return { payment };
  });
  if (reservation.error) return NextResponse.json({ error: reservation.error }, { status: 409 });
  const { payment } = reservation;
  if (reservation.reuse) return NextResponse.json({ payment: { id: payment.id, provider: payment.provider, amountMinor: payment.amountMinor, currency, checkoutUrl: payment.checkoutUrl } });

  try {
    let checkoutUrl;
    if (provider === 'CHAPA') {
      const [firstName, ...rest] = student.name.trim().split(/\s+/);
      const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: (amountMinor / 100).toFixed(2), currency, email: student.email,
          first_name: firstName, last_name: rest.join(' ') || firstName,
          tx_ref: providerReference,
          callback_url: `${publicOrigin()}/api/payments/chapa/callback?tx_ref=${encodeURIComponent(providerReference)}`,
          return_url: `${publicOrigin()}/dashboard?payment=${encodeURIComponent(payment.id)}`,
          customization: { title: 'Astegni lesson', description: lesson.title },
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success' || !result.data?.checkout_url) throw new Error('Chapa could not initialize checkout.');
      checkoutUrl = result.data.checkout_url;
    } else {
      const params = new URLSearchParams({
        mode: 'payment',
        success_url: `${publicOrigin()}/dashboard?payment=${encodeURIComponent(payment.id)}&status=success`,
        cancel_url: `${publicOrigin()}/dashboard?payment=${encodeURIComponent(payment.id)}&status=cancelled`,
        customer_email: student.email,
        client_reference_id: payment.id,
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(amountMinor),
        'line_items[0][price_data][product_data][name]': `Lesson: ${lesson.title}`,
        'metadata[paymentId]': payment.id,
      });
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const result = await response.json();
      if (!response.ok || !result.url || !result.id) throw new Error('Stripe could not initialize checkout.');
      checkoutUrl = result.url;
      await prisma.payment.update({ where: { id: payment.id }, data: { providerPaymentId: result.id } });
    }

    await prisma.payment.update({ where: { id: payment.id }, data: { checkoutUrl } });
    return NextResponse.json({ payment: { id: payment.id, provider, amountMinor, currency, checkoutUrl } }, { status: 201 });
  } catch (error) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    reportException('payments.checkout', error);
    return NextResponse.json({ error: 'Unable to start payment checkout.' }, { status: 502 });
  }
}
