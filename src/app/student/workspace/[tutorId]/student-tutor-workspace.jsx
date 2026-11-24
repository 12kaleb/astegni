'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, CalendarClock, CheckCircle2, FileText, Video } from 'lucide-react';
import { useAppShell } from '../../../../components/AppShell';
import TutorStudentChat from '../../../../components/TutorStudentChat';

function displayDate(value) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Addis_Ababa' });
}

export default function StudentTutorWorkspace() {
  const { tutorId } = useParams();
  const { user, authLoading, openAuth } = useAppShell();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const response = await fetch(`/api/students/tutors/${encodeURIComponent(tutorId)}/workspace`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load this tutor workspace.');
    setWorkspace(data);
  }, [tutorId]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'student') {
      setError('Student access is required to open this workspace.');
      setLoading(false);
      return;
    }
    let active = true;
    load().catch((reason) => { if (active) setError(reason.message || 'Unable to load this tutor workspace.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, load, user]);

  if (authLoading || loading) return <div role="status" className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">Loading your learning workspace…</div>;
  if (!user) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><p className="text-slate-600">Sign in to open your learning workspace.</p><button onClick={() => openAuth('signin')} className="btn btn-primary mt-4 px-5 py-2">Sign in</button></div>;
  if (error) return <main className="mx-auto max-w-3xl px-4 py-12"><Link href="/dashboard" className="text-sm text-slate-600">← Student dashboard</Link><p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p></main>;
  if (!workspace) return null;

  const { tutor, lessons, curriculum, assignments } = workspace;
  const completedTopics = curriculum.filter((item) => item.done).length;

  return <main className="min-h-screen bg-[#FAF7F2] pb-12">
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0A1428]"><ArrowLeft className="h-4 w-4" />Student dashboard</Link>

      <section className="mt-5 rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <Image src={tutor.avatarUrl || '/tutor_female_1.jpg'} alt="" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E05A47]">Your learning workspace</p>
            <h1 className="mt-1 font-serif text-2xl text-[#0A1428] sm:text-3xl">{tutor.name}</h1>
            <p className="mt-1 text-xs text-slate-500">{tutor.tutorProfile?.title || 'Your tutor'}{tutor.tutorProfile?.subjects?.length ? ` · ${tutor.tutorProfile.subjects.join(' · ')}` : ''}</p>
          </div>
        </div>
        {tutor.tutorProfile?.bio && <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-600">{tutor.tutorProfile.bio}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: CalendarClock, label: 'Lessons', value: lessons.length },
            { icon: CheckCircle2, label: 'Topics completed', value: `${completedTopics}/${curriculum.length}` },
            { icon: FileText, label: 'Study materials', value: assignments.length },
            { icon: BookOpen, label: 'Learning plan', value: curriculum.length ? 'Active' : 'Getting started' },
          ].map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl bg-[#FAF7F2] p-4"><Icon className="h-4 w-4 text-[#E05A47]" /><p className="mt-3 text-xl font-bold text-[#0A1428]">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div>)}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold text-[#0A1428]"><BookOpen className="h-4 w-4 text-[#E05A47]" />Your learning plan</h2><p className="mt-1 text-xs text-slate-500">Topics your tutor has planned with you.</p></div><span className="text-[10px] font-bold text-slate-500">{completedTopics}/{curriculum.length} complete</span></div>
            <div className="mt-4 space-y-2">
              {!curriculum.length && <p className="rounded-xl bg-[#FAF7F2] p-4 text-xs text-slate-500">Your tutor will add learning topics here.</p>}
              {curriculum.map((item) => <div key={item.id} className="flex items-start gap-3 rounded-xl bg-[#FAF7F2] p-3 text-sm"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>{item.done ? '✓' : ''}</span><span className={item.done ? 'text-slate-400 line-through' : 'text-[#0A1428]'}>{item.text}</span></div>)}
            </div>
          </section>

          <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#E05A47]" /><h2 className="font-bold text-[#0A1428]">Assignments &amp; study materials</h2></div>
            <div className="mt-4 space-y-2">
              {!assignments.length && <p className="rounded-xl bg-[#FAF7F2] p-4 text-xs text-slate-500">Your tutor’s assignments and shared materials will appear here.</p>}
              {assignments.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><FileText className="h-4 w-4 shrink-0 text-[#E05A47]" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#0A1428]">{item.fileName || item.title}</p><p className="mt-1 text-[10px] text-slate-500">{item.status} · Due {displayDate(item.dueDate)}{item.score != null ? ` · Score ${item.score}/${item.maxScore || 10}` : ''}</p></div>{item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-bold text-[#E05A47] underline">Open PDF</a>}</div>)}
            </div>
          </section>

          <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#E05A47]" /><h2 className="font-bold text-[#0A1428]">Lessons &amp; classroom</h2></div>
            <div className="mt-4 space-y-2">
              {!lessons.length && <p className="rounded-xl bg-[#FAF7F2] p-4 text-xs text-slate-500">Lessons you book with {tutor.name} will appear here.</p>}
              {lessons.map((lesson) => <div key={lesson.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#0A1428]">{lesson.title}</p><p className="mt-1 text-[10px] text-slate-500">{lesson.topic || 'Tutoring session'} · {displayDate(lesson.scheduledAt)} · {lesson.status}</p></div>{lesson.meetingUrl && ['CONFIRMED', 'COMPLETED'].includes(lesson.status) && <Link href={`/lessons/${encodeURIComponent(lesson.id)}`} className="inline-flex items-center gap-1 rounded-lg bg-[#E05A47] px-3 py-2 text-[10px] font-bold text-white">Open classroom <Video className="h-3 w-3" /></Link>}</div>)}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <TutorStudentChat tutorId={tutor.id} studentId={user.id} user={user} />
          <Link href="/tutors" className="inline-flex items-center gap-1 text-xs font-bold text-[#E05A47] hover:underline">Find another tutor <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </div>
  </main>;
}
