import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { consumeRateLimit } from '../../../../lib/rate-limit';
import { createStorageAdminClient } from '../../../../lib/supabase/admin-storage';

export const runtime = 'nodejs';
const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = 'verification-documents';

function supportedDocument(file, bytes) {
  if (file.type === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-') return 'pdf';
  if (file.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (file.type === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  return null;
}

export async function POST(request) {
  const tutor = await requireUser('TUTOR');
  if (!tutor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const storage = createStorageAdminClient();
  if (!storage) return NextResponse.json({ error: 'Document uploads are not configured.' }, { status: 503 });
  const limit = await consumeRateLimit({ scope: 'verification-document-upload', identity: tutor.id, limit: 8, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: limit.unavailable ? 'Uploads are temporarily unavailable.' : 'Upload limit reached. Try again later.' }, { status: limit.unavailable ? 503 : 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BYTES + 64 * 1024) return NextResponse.json({ error: 'Documents must be no larger than 8 MB.' }, { status: 413 });

  try {
    const form = await request.formData();
    const type = form.get('type');
    const file = form.get('file');
    if (!['NATIONAL_ID', 'DEGREE_CERTIFICATE'].includes(type) || !(file instanceof File)) {
      return NextResponse.json({ error: 'Choose a document type and file.' }, { status: 400 });
    }
    if (file.size < 1 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Documents must be no larger than 8 MB.' }, { status: 413 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = supportedDocument(file, bytes);
    if (!extension) return NextResponse.json({ error: 'Upload a valid PDF, JPEG, or PNG document.' }, { status: 415 });

    const existing = await prisma.verificationDocument.findFirst({ where: { tutorId: tutor.id, type, status: 'PENDING' } });
    if (existing) return NextResponse.json({ error: 'A document of this type is already awaiting review.' }, { status: 409 });
    const path = `${tutor.id}/${type.toLowerCase()}-${randomUUID()}.${extension}`;
    const { error: uploadError } = await storage.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      cacheControl: '0',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    try {
      const document = await prisma.verificationDocument.create({
        data: { tutorId: tutor.id, type, storagePath: path, contentType: file.type, sizeBytes: file.size },
        select: { id: true, type: true, status: true, createdAt: true },
      });
      return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
      await storage.storage.from(BUCKET).remove([path]);
      throw error;
    }
  } catch (error) {
    console.error('Tutor verification document upload failed:', error);
    return NextResponse.json({ error: 'Unable to upload verification document.' }, { status: 500 });
  }
}

export async function GET() {
  const tutor = await requireUser('TUTOR');
  if (!tutor) return NextResponse.json({ error: 'Tutor access required.' }, { status: 403 });
  const documents = await prisma.verificationDocument.findMany({
    where: { tutorId: tutor.id },
    select: { id: true, type: true, status: true, reviewNote: true, createdAt: true, reviewedAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ documents });
}
