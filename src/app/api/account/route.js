import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/auth';
import { consumeRateLimit } from '../../../lib/rate-limit';
import { createStorageAdminClient } from '../../../lib/supabase/admin-storage';
import { reportException } from '../../../lib/observability';

export const runtime = 'nodejs';

function avatarStoragePath(url, userId) {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    const prefix = '/storage/v1/object/public/avatars/';
    if (!pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(pathname.slice(prefix.length));
    return path.startsWith(`${userId}/`) ? path : null;
  } catch {
    return null;
  }
}

export async function DELETE(request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Sign in to delete your account.' }, { status: 401 });

  const limit = await consumeRateLimit({ scope: 'account-delete', identity: user.id, limit: 3, windowMs: 24 * 60 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: limit.unavailable ? 'Account deletion is temporarily unavailable.' : 'Deletion attempts are limited. Try again tomorrow.' }, { status: limit.unavailable ? 503 : 429 });

  let body;
  try { body = await request.json(); } catch { body = null; }
  if (body?.confirmation !== 'DELETE') return NextResponse.json({ error: 'Type DELETE to confirm account deletion.' }, { status: 400 });

  const storage = createStorageAdminClient();
  if (!storage) return NextResponse.json({ error: 'Account deletion is not configured. Contact support.' }, { status: 503 });

  const fullUser = await prisma.user.findFirst({
    where: { id: user.id, deletedAt: null },
    select: { id: true, supabaseAuthId: true, avatarUrl: true, tutorProfile: { select: { id: true } }, verificationDocuments: { select: { storagePath: true } } },
  });
  if (!fullUser) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

  try {
    const documentPaths = fullUser.verificationDocuments.map((doc) => doc.storagePath);
    if (documentPaths.length) {
      const { error } = await storage.storage.from('verification-documents').remove(documentPaths);
      if (error) throw error;
    }
    const avatarPath = avatarStoragePath(fullUser.avatarUrl, fullUser.id);
    if (avatarPath) {
      const { error } = await storage.storage.from('avatars').remove([avatarPath]);
      if (error) throw error;
    }

    const { error: authError } = await storage.auth.admin.deleteUser(fullUser.supabaseAuthId);
    if (authError) throw authError;

    await prisma.$transaction(async (tx) => {
      await tx.verificationDocument.deleteMany({ where: { tutorId: fullUser.id } });
      await tx.tutorSelection.deleteMany({ where: { OR: [{ studentId: fullUser.id }, { tutorId: fullUser.id }] } });
      await tx.availability.deleteMany({ where: { tutorId: fullUser.id } });
      await tx.userBlock.deleteMany({ where: { OR: [{ blockerId: fullUser.id }, { blockedId: fullUser.id }] } });
      await tx.guardianConsent.deleteMany({ where: { studentId: fullUser.id } });
      await tx.lesson.updateMany({
        where: { OR: [{ studentId: fullUser.id }, { tutorId: fullUser.id }], status: { in: ['PENDING', 'CONFIRMED'] }, scheduledAt: { gte: new Date() } },
        data: { status: 'CANCELLED', meetingUrl: null, pendingActionById: null, pendingActionReason: null, cancellationReason: 'Account deleted' },
      });
      if (fullUser.tutorProfile) {
        await tx.tutorProfile.update({
          where: { userId: fullUser.id },
          data: { title: null, university: null, location: null, bio: null, hourlyRateETB: null, subjects: [], modes: [], gradeLevels: [], languages: [], activeDays: [], typicalHours: null, openForStudents: false, isVerified: false, verificationStatus: 'REJECTED' },
        });
      }
      await tx.user.update({
        where: { id: fullUser.id },
        data: { deletedAt: new Date(), supabaseAuthId: randomUUID(), email: `deleted+${fullUser.id}@deleted.invalid`, name: 'Deleted account', avatarUrl: null, phone: null, isMinor: false, timeZone: 'Africa/Addis_Ababa' },
      });
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    reportException('account.delete', error);
    return NextResponse.json({ error: 'Unable to delete the account right now. Contact support if this continues.' }, { status: 500 });
  }
}
