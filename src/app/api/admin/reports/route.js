import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { reportReviewSchema, validationMessage } from '../../../../lib/validation';

export async function GET() {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const reports = await prisma.safetyReport.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: {
    id: true, category: true, details: true, status: true, createdAt: true,
    reporter: { select: { id: true, name: true, email: true } },
    reportedUser: { select: { id: true, name: true, email: true } },
  } });
  return NextResponse.json({ reports });
}

export async function PATCH(request) {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const validation = reportReviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
  try {
    const changed = await prisma.$transaction(async (tx) => {
      const result = await tx.safetyReport.updateMany({ where: { id: validation.data.reportId, status: { in: ['OPEN', 'REVIEWING'] } }, data: { status: validation.data.status } });
      if (!result.count) return false;
      await tx.auditLog.create({ data: { actorId: admin.id, action: `safety_report.${validation.data.status.toLowerCase()}`, targetType: 'SafetyReport', targetId: validation.data.reportId } });
      return true;
    });
    if (!changed) return NextResponse.json({ error: 'Report not found or already closed.' }, { status: 409 });
    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error('Safety report review failed:', error);
    return NextResponse.json({ error: 'Unable to update report.' }, { status: 500 });
  }
}
