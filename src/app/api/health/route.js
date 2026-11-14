import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { reportException } from '../../../lib/observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', checks: { database: 'ok' }, timestamp: new Date().toISOString() });
  } catch (error) {
    reportException('health.database', error);
    return NextResponse.json({ status: 'unavailable', checks: { database: 'failed' }, timestamp: new Date().toISOString() }, { status: 503 });
  }
}
