import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { createStorageAdminClient } from '../../../../lib/supabase/admin-storage';

async function requireReviewer() {
  return (await requireUser('MANAGER')) || (await requireUser('SUPPORT_SPECIALIST'));
}

export async function GET() {
  const reviewer = await requireReviewer();
  if (!reviewer) return NextResponse.json({ error: 'Manager or tech staff access required.' }, { status: 403 });

  const documents = await prisma.verificationDocument.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: { id: true, type: true, contentType: true, sizeBytes: true, storagePath: true, createdAt: true, tutor: { select: { id: true, name: true, email: true } } },
  });
  const storage = createStorageAdminClient();
  if (!storage) return NextResponse.json({ documents: documents.map(({ storagePath, ...document }) => document), storageConfigured: false });

  const withUrls = await Promise.all(documents.map(async ({ storagePath, ...document }) => {
    const { data, error } = await storage.storage.from('verification-documents').createSignedUrl(storagePath, 60);
    if (error) throw error;
    return { ...document, signedUrl: data.signedUrl };
  }));
  return NextResponse.json({ documents: withUrls, storageConfigured: true });
}
