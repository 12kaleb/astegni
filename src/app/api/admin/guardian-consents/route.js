import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { z } from 'zod';
import { lockBookingParticipants } from '../../../../lib/bookings';

const reviewSchema = z.object({ consentId: z.string().min(1).max(64), status: z.enum(['APPROVED', 'REJECTED']), note: z.string().trim().max(1000).optional() }).strict();

export async function GET() {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const consents = await prisma.guardianConsent.findMany({
    where: { status: 'PENDING' }, orderBy: { submittedAt: 'asc' }, take: 100,
    select: { id: true, guardianName: true, guardianEmail: true, policyVersion: true, submittedAt: true, student: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ consents });
}

export async function PATCH(request) {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(' ') }, { status: 400 });
  try {
    const consent = await prisma.$transaction(async (tx) => {
      const existing = await tx.guardianConsent.findUnique({ where: { id: parsed.data.consentId }, select: { studentId: true } });
      if (!existing) return null;
      await lockBookingParticipants(tx, [existing.studentId]);
      const updated = await tx.guardianConsent.updateMany({ where: { id: parsed.data.consentId, status: 'PENDING' }, data: { status: parsed.data.status, reviewedAt: new Date(), reviewerId: admin.id, reviewerNote: parsed.data.note || null } });
      if (!updated.count) return null;
      const row = await tx.guardianConsent.findUnique({ where: { id: parsed.data.consentId }, select: { studentId: true } });
      await tx.auditLog.create({ data: { actorId: admin.id, action: `guardian_consent.${parsed.data.status.toLowerCase()}`, targetType: 'GuardianConsent', targetId: parsed.data.consentId, metadata: { studentId: row.studentId } } });
      return row;
    });
    if (!consent) return NextResponse.json({ error: 'Consent not found or already reviewed.' }, { status: 409 });
    return NextResponse.json({ reviewed: true, status: parsed.data.status });
  } catch (error) {
    console.error('Guardian consent review failed:', error);
    return NextResponse.json({ error: 'Unable to review guardian consent.' }, { status: 500 });
  }
}
