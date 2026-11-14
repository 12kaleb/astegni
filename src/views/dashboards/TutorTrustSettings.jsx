'use client';

import { useCallback, useEffect, useState } from 'react';

export default function TutorTrustSettings({ onAvatarUpdated }) {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch('/api/tutors/verification-documents', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load verification documents.');
    setDocuments(result.documents || []);
  }, []);
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [load]);

  async function uploadDocument(type, file) {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const form = new FormData(); form.set('type', type); form.set('file', file);
      const response = await fetch('/api/tutors/verification-documents', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      setMessage('Document uploaded for private admin review.'); await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }

  async function uploadAvatar(file) {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const form = new FormData(); form.set('file', file);
      const response = await fetch('/api/users/avatar', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Avatar upload failed.');
      onAvatarUpdated?.(result.avatarUrl); setMessage('Avatar updated.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="font-bold text-[#0A1428]">Trust and profile images</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">Verification files are private. Upload a national ID and degree certificate, each up to 8 MB. Avatar images are public and limited to 2 MB.</p>
    <div className="mt-4 flex flex-wrap gap-3">
      {['NATIONAL_ID', 'DEGREE_CERTIFICATE'].map((type) => {
        const latest = documents.find((document) => document.type === type);
        const pending = latest?.status === 'PENDING';
        return <label key={type} className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold ${pending ? 'pointer-events-none opacity-50' : ''}`}>
          {type.replaceAll('_', ' ')} · {latest?.status || 'UPLOAD'}
          <input disabled={busy || pending} type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => uploadDocument(type, event.target.files?.[0])} />
        </label>;
      })}
      <label className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold">Upload avatar
        <input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
      </label>
    </div>
    {message && <p role="status" className="mt-3 text-xs text-slate-600">{message}</p>}
  </section>;
}
