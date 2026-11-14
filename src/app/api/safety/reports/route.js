import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { consumeRateLimit } from '../../../../lib/rate-limit';
import { safetyReportSchema, validationMessage } from '../../../../lib/validation';

export async function POST(request) {
  try {
    const reporter = await requireUser();
    if (!reporter || !['STUDENT', 'TUTOR'].includes(reporter.role)) {
      return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
    }
    const limit = await consumeRateLimit({ scope: 'safety-report', identity: reporter.id, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return NextResponse.json({ error: limit.unavailable ? 'Reporting is temporarily unavailable.' : 'Report limit reached. Try again later.' }, { status: limit.unavailable ? 503 : 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
    const body = await request.json().catch(() => null);
    const validation = safetyReportSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    if (validation.data.reportedUserId === reporter.id) return NextResponse.json({ error: 'You cannot report your own account.' }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id: validation.data.reportedUserId }, select: { id: true, role: true } });
    if (!target || !['STUDENT', 'TUTOR'].includes(target.role) || target.role === reporter.role) {
      return NextResponse.json({ error: 'Reports are limited to student and tutor interactions.' }, { status: 404 });
    }
    const report = await prisma.safetyReport.create({ data: { reporterId: reporter.id, ...validation.data }, select: { id: true, status: true, createdAt: true } });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Safety report creation failed:', error);
    return NextResponse.json({ error: 'Unable to submit report.' }, { status: 500 });
  }
}
