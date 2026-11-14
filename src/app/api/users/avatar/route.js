import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { consumeRateLimit } from '../../../../lib/rate-limit';
import { createStorageAdminClient } from '../../../../lib/supabase/admin-storage';

export const runtime = 'nodejs';
const MAX_BYTES = 2 * 1024 * 1024;

function imageExtension(file, bytes) {
  if (file.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (file.type === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (file.type === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

export async function POST(request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Sign in to upload an avatar.' }, { status: 401 });
  const storage = createStorageAdminClient();
  if (!storage) return NextResponse.json({ error: 'Avatar uploads are not configured.' }, { status: 503 });
  const limit = await consumeRateLimit({ scope: 'avatar-upload', identity: user.id, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: limit.unavailable ? 'Uploads are temporarily unavailable.' : 'Upload limit reached. Try again later.' }, { status: limit.unavailable ? 503 : 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BYTES + 64 * 1024) return NextResponse.json({ error: 'Avatar images must be no larger than 2 MB.' }, { status: 413 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 });
    if (!file.size || file.size > MAX_BYTES) return NextResponse.json({ error: 'Avatar images must be no larger than 2 MB.' }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = imageExtension(file, bytes);
    if (!extension) return NextResponse.json({ error: 'Upload a valid JPEG, PNG, or WebP image.' }, { status: 415 });

    const path = `${user.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await storage.storage.from('avatars').upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data } = storage.storage.from('avatars').getPublicUrl(path);
    try {
      await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: data.publicUrl } });
    } catch (error) {
      await storage.storage.from('avatars').remove([path]);
      throw error;
    }
    return NextResponse.json({ avatarUrl: data.publicUrl });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return NextResponse.json({ error: 'Unable to upload avatar.' }, { status: 500 });
  }
}
