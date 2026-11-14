'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

export default function AccountPrivacy() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function deleteAccount(event) {
    event.preventDefault();
    if (confirmation !== 'DELETE') return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete account.');
      await createClient().auth.signOut();
      router.replace('/');
      router.refresh();
    } catch (cause) {
      setError(cause.message || 'Could not delete account.');
      setBusy(false);
    }
  }

  return (
    <main className="container max-w-3xl py-12">
      <div className="rounded-3xl border border-[#E8E2D8] bg-white p-6 shadow-sm md:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-[#E05A47]">Your data</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#0A1428]">Account &amp; privacy</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Download a copy of your account information, or permanently deactivate your account.</p>

        <section className="mt-8 rounded-2xl bg-[#FAF7F2] p-5">
          <h2 className="font-bold text-[#0A1428]">Export your data</h2>
          <p className="mt-1 text-sm text-slate-600">Get a JSON file with your profile, lessons, assignments, progress, reviews and payment history.</p>
          <a href="/api/account/export" className="mt-4 inline-flex rounded-full bg-[#0A1428] px-5 py-2.5 text-sm font-bold text-white">Download export</a>
        </section>

        <section className="mt-8 border-t border-[#E8E2D8] pt-7">
          <h2 className="font-bold text-red-800">Delete your account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your sign-in and public profile will be removed, and private verification files will be deleted. Lesson, assignment, progress, review and payment records stay in the system for history, safety and financial records; your account details in those records are anonymized.</p>
          <form onSubmit={deleteAccount} className="mt-5 space-y-3">
            <label htmlFor="delete-confirmation" className="block text-sm font-semibold text-[#0A1428]">Type DELETE to confirm</label>
            <input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy || confirmation !== 'DELETE'} className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Deleting…' : 'Delete account'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
