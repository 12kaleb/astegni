import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Sign in to export your data.' }, { status: 401 });

  const data = await prisma.user.findFirst({
    where: { id: user.id, deletedAt: null },
    select: {
      id: true, email: true, name: true, role: true, avatarUrl: true, phone: true,
      isMinor: true, timeZone: true, createdAt: true, updatedAt: true,
      tutorProfile: true,
      studentLessons: { orderBy: { scheduledAt: 'desc' }, include: { review: true, payment: { select: { id: true, lessonId: true, provider: true, status: true, amountMinor: true, currency: true, paidAt: true, createdAt: true, updatedAt: true } }, tutor: { select: { id: true, name: true } } } },
      tutorLessons: { orderBy: { scheduledAt: 'desc' }, include: { student: { select: { id: true, name: true } }, review: true } },
      studentAssignments: { orderBy: { dueDate: 'desc' } },
      subjectProgress: true,
      selectedTutors: { include: { tutor: { select: { id: true, name: true } } } },
      authoredReviews: true,
      payments: { select: { id: true, lessonId: true, provider: true, status: true, amountMinor: true, currency: true, paidAt: true, createdAt: true, updatedAt: true } },
      guardianConsent: true,
      availability: true,
      verificationDocuments: { select: { id: true, type: true, contentType: true, sizeBytes: true, status: true, createdAt: true, reviewedAt: true, reviewNote: true } },
    },
  });
  if (!data) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), account: data }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="astegni-data-export-${date}.json"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
