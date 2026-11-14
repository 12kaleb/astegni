import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { invitationAcceptSchema, validationMessage } from '../../../../lib/validation';
import { consumeRateLimit, rateLimitExceededResponse } from '../../../../lib/rate-limit';

export async function POST(request) {
  try {
    const appUser = await requireUser();
    if (!appUser) {
      return NextResponse.json({ error: 'Sign in with the invited email address.' }, { status: 401 });
    }

    const rate = await consumeRateLimit({ scope: 'invitation-accept', identity: appUser.id, limit: 10, windowMs: 60 * 60 * 1000 });
    if (!rate.allowed) return rateLimitExceededResponse(rate, 'Too many invitation attempts. Try again later.');

    const body = await request.json().catch(() => null);
    const validation = invitationAcceptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: validation.data.invitationId },
      select: { id: true, email: true, role: true, acceptedAt: true, expiresAt: true },
    });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Invitation is invalid, expired, or already used.' }, { status: 404 });
    }
    if (invitation.email.toLowerCase() !== appUser.email.toLowerCase()) {
      return NextResponse.json({ error: 'Sign in with the invited email address.' }, { status: 403 });
    }

    const accepted = await prisma.$transaction(async (tx) => {
      const result = await tx.invitation.updateMany({
        where: { id: invitation.id, acceptedAt: null, expiresAt: { gt: new Date() } },
        data: { acceptedAt: new Date() },
      });
      if (result.count !== 1) return false;

      await tx.user.update({
        where: { id: appUser.id },
        data: { role: invitation.role },
      });
      await tx.auditLog.create({
        data: { actorId: appUser.id, action: 'invitation.accepted_role_changed', targetType: 'User', targetId: appUser.id, metadata: { role: invitation.role, invitationId: invitation.id } },
      });
      return true;
    });

    if (!accepted) {
      return NextResponse.json({ error: 'Invitation is invalid, expired, or already used.' }, { status: 409 });
    }

    return NextResponse.json({ accepted: true, role: invitation.role });
  } catch (error) {
    console.error('Invitation acceptance failed:', error);
    return NextResponse.json({ error: 'Unable to accept invitation.' }, { status: 500 });
  }
}
