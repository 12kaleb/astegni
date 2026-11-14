import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { verificationReviewSchema, validationMessage } from '../../../../../lib/validation';

export async function PATCH(request, context) {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const validation = verificationReviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  const { id } = await context.params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const document = await tx.verificationDocument.findUnique({ where: { id }, select: { id: true, tutorId: true, type: true, status: true } });
      if (!document) return null;
      const result = await tx.verificationDocument.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: validation.data.status, reviewerId: admin.id, reviewedAt: new Date(), reviewNote: validation.data.note || null },
      });
      if (result.count !== 1) return false;
      if (validation.data.status === 'REJECTED') {
        await tx.tutorProfile.updateMany({ where: { userId: document.tutorId }, data: { verificationStatus: 'PENDING', isVerified: false } });
      }
      await tx.auditLog.create({
        data: { actorId: admin.id, action: `verification_document.${validation.data.status.toLowerCase()}`, targetType: 'VerificationDocument', targetId: id, metadata: { tutorId: document.tutorId, type: document.type } },
      });
      return document;
    });
    if (!updated) return NextResponse.json({ error: 'Document not found or already reviewed.' }, { status: 409 });
    return NextResponse.json({ reviewed: true, status: validation.data.status });
  } catch (error) {
    console.error('Verification document review failed:', error);
    return NextResponse.json({ error: 'Unable to review verification document.' }, { status: 500 });
  }
}
