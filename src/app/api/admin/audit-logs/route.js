import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';

export async function GET() {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const events = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, action: true, targetType: true, targetId: true, metadata: true, createdAt: true, actor: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ events });
}
