import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { blockUserSchema, validationMessage } from '../../../../lib/validation';

export async function GET() {
  const user = await requireUser();
  if (!user || !['STUDENT', 'TUTOR'].includes(user.role)) return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
  const blocks = await prisma.userBlock.findMany({ where: { blockerId: user.id }, select: { blockedId: true, createdAt: true } });
  return NextResponse.json({ blocks });
}

export async function POST(request) {
  try {
    const user = await requireUser();
    if (!user || !['STUDENT', 'TUTOR'].includes(user.role)) return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
    const body = await request.json().catch(() => null);
    const validation = blockUserSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    if (validation.data.userId === user.id) return NextResponse.json({ error: 'You cannot block your own account.' }, { status: 400 });
    const target = await prisma.user.findUnique({ where: { id: validation.data.userId }, select: { id: true, role: true } });
    if (!target || !['STUDENT', 'TUTOR'].includes(target.role) || target.role === user.role) return NextResponse.json({ error: 'Blocking is limited to student and tutor accounts.' }, { status: 404 });
    await prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } }, create: { blockerId: user.id, blockedId: target.id }, update: {} });
    return NextResponse.json({ blocked: true });
  } catch (error) {
    console.error('User block failed:', error);
    return NextResponse.json({ error: 'Unable to block this account.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await requireUser();
    if (!user || !['STUDENT', 'TUTOR'].includes(user.role)) return NextResponse.json({ error: 'Student or tutor access required.' }, { status: 403 });
    const body = await request.json().catch(() => null);
    const validation = blockUserSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    await prisma.userBlock.deleteMany({ where: { blockerId: user.id, blockedId: validation.data.userId } });
    return NextResponse.json({ blocked: false });
  } catch (error) {
    console.error('User unblock failed:', error);
    return NextResponse.json({ error: 'Unable to unblock this account.' }, { status: 500 });
  }
}
