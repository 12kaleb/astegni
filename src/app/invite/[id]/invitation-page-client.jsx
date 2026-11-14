'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppShell } from '../../../components/AppShell';

export default function InvitationPageClient({ invitationId }) {
  const router = useRouter();
  const { user, authLoading, openAuth } = useAppShell();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  async function acceptInvitation() {
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to accept invitation.');
      router.push('/dashboard');
    } catch (error) {
      setMessage(error.message || 'Unable to accept invitation.');
      setPending(false);
    }
  }

  return (
    <main className="container flex min-h-[55vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-extrabold text-[#0A1428]">You’re invited to Astegni</h1>
      {authLoading ? (
        <p role="status" className="mt-4 text-sm text-slate-500">Checking your sign-in…</p>
      ) : user ? (
        <>
          <p className="mt-3 text-sm text-slate-600">Signed in as {user.name}. Accept this invitation to activate the role assigned to your email.</p>
          <button onClick={acceptInvitation} disabled={pending} className="btn btn-primary mt-6 rounded-xl px-6 py-3 font-bold disabled:opacity-50">
            {pending ? 'Accepting…' : 'Accept invitation'}
          </button>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-600">Sign in or create an account using the email address that received this invitation.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => openAuth('signin')} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#0A1428]">Sign in</button>
            <button onClick={() => openAuth('register')} className="btn btn-primary rounded-xl px-5 py-3 font-bold">Create account</button>
          </div>
        </>
      )}
      {message && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>}
      <button onClick={() => router.push('/')} className="mt-8 text-sm font-semibold text-[#E05A47] hover:underline">Return home</button>
    </main>
  );
}
