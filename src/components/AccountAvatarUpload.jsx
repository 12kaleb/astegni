'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AccountAvatarUpload({ initialUrl, name }) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function upload(file) {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const form = new FormData(); form.set('file', file);
      const response = await fetch('/api/users/avatar', { method: 'POST', body: form });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Avatar upload failed.');
      setAvatarUrl(result.avatarUrl); setMessage('Avatar updated.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
    {avatarUrl ? <Image src={avatarUrl} alt={`${name}'s avatar`} width={44} height={44} className="h-11 w-11 rounded-full object-cover" /> : <div aria-label="No avatar uploaded" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">{name?.charAt(0) || '?'}</div>}
    <label className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold">{busy ? 'Uploading…' : 'Change avatar'}
      <input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} />
    </label>
    <span className="text-[11px] text-slate-500">JPEG, PNG, or WebP · 2 MB max</span>
    {message && <span role="status" className="text-xs text-slate-600">{message}</span>}
  </div>;
}
