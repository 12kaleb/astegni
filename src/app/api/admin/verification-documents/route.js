import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { createStorageAdminClient } from '../../../../lib/supabase/admin-storage';

export async function GET() {
  const admin = await requireUser('ADMIN');
  if (!admin) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const storage = createStorageAdminClient();
  const documents = await prisma.verificationDocument.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 100,
    select: { id: true, type: true, contentType: true, sizeBytes: true, storagePath: true, createdAt: true, tutor: { select: { id: true, name: true, email: true } } },
  });
  if (!storage) return NextResponse.json({ documents: documents.map(({ storagePath, ...document }) => document), storageConfigured: false });
  const withUrls = await Promise.all(documents.map(async (document) => {
    const { storagePath, ...safeDocument } = document;
    const { data, error } = await storage.storage.from('verification-documents').createSignedUrl(storagePath, 60);
    if (error) throw error;
    return { ...safeDocument, signedUrl: data.signedUrl };
  }));
  return NextResponse.json({ documents: withUrls, storageConfigured: true });
}
