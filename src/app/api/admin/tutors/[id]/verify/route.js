import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { reportException } from '../../../../../../lib/observability';
import { requireUser } from '../../../../../../lib/auth';
import { tutorVerificationSchema, validationMessage } from '../../../../../../lib/validation';

export async function PATCH(request, context) {
  try {
    const admin = await requireUser('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const validation = tutorVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validationMessage(validation.error) },
        { status: 400 }
      );
    }

    const existingProfile = await prisma.tutorProfile.findUnique({
      where: { userId: id },
      select: { userId: true },
    });
    if (!existingProfile) {
      return NextResponse.json({ error: 'Tutor profile not found.' }, { status: 404 });
    }

    if (validation.data.status === 'APPROVED') {
      const approvedTypes = await prisma.verificationDocument.findMany({
        where: { tutorId: id, status: 'APPROVED' },
        select: { type: true },
      });
      const types = new Set(approvedTypes.map((document) => document.type));
      if (!types.has('NATIONAL_ID') || !types.has('DEGREE_CERTIFICATE')) {
        return NextResponse.json({ error: 'Approve a national ID and degree certificate before verifying this tutor.' }, { status: 409 });
      }
    }

    const tutorProfile = await prisma.tutorProfile.update({
      where: { userId: id },
      data: {
        verificationStatus: validation.data.status,
        isVerified: validation.data.status === 'APPROVED',
      },
      select: { userId: true, verificationStatus: true, isVerified: true },
    });

    await prisma.auditLog.create({
      data: { actorId: admin.id, action: `tutor.verification.${validation.data.status.toLowerCase()}`, targetType: 'TutorProfile', targetId: id },
    });

    return NextResponse.json({ tutorProfile });
  } catch (error) {
    reportException('admin.tutor-verification', error);
    return NextResponse.json(
      { error: 'Unable to update tutor verification.' },
      { status: 500 }
    );
  }
}
