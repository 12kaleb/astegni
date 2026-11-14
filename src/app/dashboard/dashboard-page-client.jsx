'use client';

import DashboardView from '../../views/DashboardView';
import { useAppShell } from '../../components/AppShell';
import AccountAvatarUpload from '../../components/AccountAvatarUpload';

export default function DashboardPageClient() {
  const { user, authLoading, navigate, openAuth, selectTutor, selectedTutorIds } = useAppShell();

  if (authLoading) {
    return (
      <div role="status" className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E05A47]/30 border-t-[#E05A47]" />
          <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto my-16 max-w-xl rounded-2xl border border-[#E8E2D8] bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-[#0A1428]">Sign in to view your dashboard</h1>
        <button onClick={() => openAuth('signin')} className="btn btn-primary mt-5 rounded-xl px-6 py-3 font-bold">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="container max-w-[1240px] pt-6"><AccountAvatarUpload initialUrl={user.avatarUrl} name={user.name} /></div>
    <DashboardView
      user={user}
      onFindTutor={() => navigate('tutors')}
      onSelectTutor={selectTutor}
      selectedTutorIds={selectedTutorIds}
      onJoinLesson={(lesson) => window.open(lesson.meetingUrl, '_blank', 'noopener,noreferrer')}
    />
    </>
  );
}
