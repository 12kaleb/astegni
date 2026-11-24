'use client';

import { useParams } from 'next/navigation';
import { useAppShell } from '../../../components/AppShell';
import LessonSessionView from '../../../views/LessonSessionView';

export default function LessonSessionClient() {
  const { id } = useParams();
  const { user, authLoading, openAuth } = useAppShell();

  if (authLoading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E05A47]/30 border-t-[#E05A47]" />
          <p className="text-sm font-medium text-slate-500">Loading your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-[#E8E2D8] bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#0A1428]">Sign in to join your lesson</h1>
          <p className="mt-2 text-sm text-slate-500">You need to be signed in to access this session.</p>
          <button
            onClick={() => openAuth('signin')}
            className="btn btn-primary mt-6 w-full text-sm font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <LessonSessionView lessonId={id} user={user} />;
}
