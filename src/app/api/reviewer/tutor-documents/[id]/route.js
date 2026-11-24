import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../lib/auth';
import { verificationReviewSchema, validationMessage } from '../../../../../lib/validation';

async function requireReviewer() {
  return (await requireUser('MANAGER')) || (await requireUser('SUPPORT_SPECIALIST'));
}

export async function PATCH(request, context) {
  const reviewer = await requireReviewer();
  if (!reviewer) return NextResponse.json({ error: 'Manager or tech staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const validation = verificationReviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  const { id } = await context.params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const document = await tx.verificationDocument.findUnique({ where: { id }, select: { id: true, tutorId: true, type: true } });
      if (!document) return false;
      const result = await tx.verificationDocument.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: validation.data.status, reviewerId: reviewer.id, reviewedAt: new Date(), reviewNote: validation.data.note || null },
      });
      if (result.count !== 1) return false;
      if (validation.data.status === 'REJECTED') {
        await tx.tutorProfile.updateMany({ where: { userId: document.tutorId }, data: { verificationStatus: 'PENDING', isVerified: false } });
      }
      await tx.auditLog.create({
        data: { actorId: reviewer.id, action: `verification_document.${validation.data.status.toLowerCase()}`, targetType: 'VerificationDocument', targetId: id, metadata: { tutorId: document.tutorId, type: document.type } },
      });
      return true;
    });
    if (!updated) return NextResponse.json({ error: 'Document not found or already reviewed.' }, { status: 409 });
    return NextResponse.json({ reviewed: true, status: validation.data.status });
  } catch (error) {
    console.error('Tutor document review failed:', error);
    return NextResponse.json({ error: 'Unable to review tutor document.' }, { status: 500 });
  }
}
