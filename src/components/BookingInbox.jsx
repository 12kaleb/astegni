'use client';

import { useState } from 'react';
import { useAppShell } from './AppShell';
import { useApiResource } from '../lib/use-api-resource';

const selectLessons = (result) => Array.isArray(result.lessons) ? result.lessons : [];

function displayTime(value, timeZone) {
  return `${new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone })} (${timeZone})`;
}

export default function BookingInbox({ role }) {
  const { user, updateTimeZone } = useAppShell();
  const resource = useApiResource('/api/lessons', selectLessons, Boolean(user));
  const lessons = resource.data || [];
  const error = resource.error;
  const setError = resource.setError;
  const [busyId, setBusyId] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [reason, setReason] = useState('');
  const load = resource.reload;

  async function act(lesson, action, payload = {}) {
    setBusyId(lesson.id); setError('');
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lesson.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to update booking.');
      if (payload.timeZone) updateTimeZone(payload.timeZone);
      setRescheduleId(null); setReason(''); setNewTime(''); await load();
    } catch (failure) { setError(failure.message); } finally { setBusyId(null); }
  }

  async function cancel(lesson) {
    const cancellationReason = window.prompt('Why are you cancelling? (At least 5 characters)');
    if (!cancellationReason || cancellationReason.trim().length < 5) return;
    await act(lesson, 'CANCEL', { reason: cancellationReason.trim() });
  }

  if (!lessons.length && !error && !resource.loading) {
    return <section className="container max-w-[1240px] py-5" aria-label="Lesson bookings"><p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">No current lesson bookings.</p></section>;
  }
  return <section className="container max-w-[1240px] py-5" aria-label="Lesson bookings">
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-[#0A1428]">Lesson bookings</h2>
      <p className="mt-1 text-xs text-slate-500">All times are shown in your saved time zone.</p>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      {resource.loading && <p role="status" className="mt-3 text-sm text-slate-600">Loading bookings…</p>}
      <div className="mt-4 space-y-3">{lessons.map((lesson) => {
        const isTutor = role === 'tutor';
        const otherName = isTutor ? lesson.student.name : lesson.tutor.name;
        const initialRequest = lesson.status === 'PENDING' && !lesson.previousScheduledAt;
        const proposed = lesson.status === 'PENDING' && Boolean(lesson.previousScheduledAt);
        const canRespondInitial = isTutor && initialRequest && lesson.pendingActionById === lesson.studentId;
        const canRespondProposal = proposed && !lesson.pendingActionByMe;
        return <article key={lesson.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-[#0A1428]">{lesson.title} · {otherName}</h3>
              <p className="mt-1 text-xs text-slate-600">{proposed && lesson.previousScheduledAt ? <><span className="line-through">{displayTime(lesson.previousScheduledAt, lesson.viewerTimeZone)}</span> → </> : null}{displayTime(lesson.scheduledAt, lesson.viewerTimeZone)} · {lesson.durationMins} min · {lesson.status.replaceAll('_', ' ').toLowerCase()}</p>
              {lesson.pendingActionReason && <p className="mt-1 text-xs text-slate-500">Reschedule reason: {lesson.pendingActionReason}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {canRespondInitial && <><button disabled={busyId === lesson.id} onClick={() => act(lesson, 'CONFIRM')} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">Confirm</button><button disabled={busyId === lesson.id} onClick={() => act(lesson, 'DECLINE')} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">Decline</button></>}
              {canRespondProposal && <><button disabled={busyId === lesson.id} onClick={() => act(lesson, 'ACCEPT_RESCHEDULE')} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">Accept new time</button><button disabled={busyId === lesson.id} onClick={() => act(lesson, 'DECLINE_RESCHEDULE')} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">Decline change</button></>}
              {initialRequest && lesson.pendingActionByMe && <button disabled={busyId === lesson.id} onClick={() => cancel(lesson)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Cancel request</button>}
              {lesson.status === 'CONFIRMED' && <button disabled={busyId === lesson.id} onClick={() => cancel(lesson)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Cancel</button>}
            </div>
          </div>
          {lesson.status === 'PENDING' && !canRespondInitial && !canRespondProposal && <p className="mt-3 text-xs text-amber-700">Waiting for the {lesson.pendingActionByMe ? (isTutor ? 'student' : 'tutor') : (isTutor ? 'student' : 'tutor')} to respond.</p>}
          {lesson.status === 'CONFIRMED' && <div className="mt-3">
            {rescheduleId === lesson.id ? <form onSubmit={(event) => { event.preventDefault(); act(lesson, 'RESCHEDULE', { scheduledAt: new Date(newTime).toISOString(), durationMins: Number(newDuration), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || lesson.viewerTimeZone, reason }); }} className="flex flex-wrap items-center gap-2">
              <input required type="datetime-local" value={newTime} onChange={(event) => setNewTime(event.target.value)} aria-label="Proposed new lesson time" className="rounded-lg border border-slate-300 px-2 py-2 text-xs" />
              <select value={newDuration} onChange={(event) => setNewDuration(event.target.value)} aria-label="New duration" className="rounded-lg border border-slate-300 px-2 py-2 text-xs">{[30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}</select>
              <input required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason for rescheduling" aria-label="Reschedule reason" className="min-w-48 rounded-lg border border-slate-300 px-2 py-2 text-xs" />
              <button disabled={busyId === lesson.id} className="rounded-lg bg-[#0A1428] px-3 py-2 text-xs font-bold text-white">Send proposal</button>
              <button type="button" onClick={() => setRescheduleId(null)} className="text-xs underline">Cancel</button>
            </form> : <button onClick={() => { setRescheduleId(lesson.id); setReason(''); }} className="text-xs font-semibold text-[#E05A47] underline">Propose a new time</button>}
          </div>}
        </article>;
      })}</div>
    </div>
  </section>;
}
