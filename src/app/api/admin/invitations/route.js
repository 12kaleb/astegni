import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { invitationCreateSchema, validationMessage } from '../../../../lib/validation';

export async function POST(request) {
  try {
    const admin = await requireUser('ADMIN');
    const manager = admin ? null : await requireUser('MANAGER');
    const inviter = admin || manager;
    if (!inviter) {
      return NextResponse.json({ error: 'Admin or manager access required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = invitationCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }

    const { email, role } = validation.data;
    if (!admin && role !== 'SUPPORT_SPECIALIST') {
      return NextResponse.json({ error: 'Managers may invite support specialists only.' }, { status: 403 });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, role: true } });
    if (existingUser && existingUser.role === role) {
      return NextResponse.json({ error: 'This account already has the invited role.' }, { status: 409 });
    }

    const pendingInvite = await prisma.invitation.findFirst({
      where: { email: normalizedEmail, role, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, role: true, expiresAt: true },
    });
    const invitation = pendingInvite || await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        role,
        invitedById: inviter.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, email: true, role: true, expiresAt: true },
    });

    if (!pendingInvite) {
      await prisma.auditLog.create({
        data: { actorId: inviter.id, action: 'invitation.created', targetType: 'Invitation', targetId: invitation.id, metadata: { email: normalizedEmail, role } },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    return NextResponse.json({
      invitation,
      inviteUrl: new URL(`/invite/${invitation.id}`, baseUrl).toString(),
    }, { status: pendingInvite ? 200 : 201 });
  } catch (error) {
    console.error('Invitation creation failed:', error);
    return NextResponse.json({ error: 'Unable to create invitation.' }, { status: 500 });
  }
}
