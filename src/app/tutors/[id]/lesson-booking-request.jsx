'use client';

import { useEffect, useState } from 'react';
import { useAppShell } from '../../../components/AppShell';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function LessonBookingRequest({ tutorProfileId }) {
  const { user, openAuth, updateTimeZone } = useAppShell();
  const [availability, setAvailability] = useState(null);
  const [title, setTitle] = useState('Tutoring session');
  const [topic, setTopic] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/tutors/${encodeURIComponent(tutorProfileId)}/availability`, { cache: 'no-store' })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; })
      .then((result) => { if (active) setAvailability(result); })
      .catch((error) => { if (active) setMessage(error.message || 'Unable to load tutor availability.'); });
    return () => { active = false; };
  }, [tutorProfileId]);

  async function submit(event) {
    event.preventDefault();
    if (!user) { openAuth('signin'); return; }
    if (user.role !== 'student') { setMessage('Only student accounts can request a lesson.'); return; }
    setBusy(true); setMessage('');
    try {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Addis_Ababa';
      const response = await fetch('/api/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorProfileId, title, topic, scheduledAt: new Date(scheduledAt).toISOString(), durationMins: Number(durationMins), timeZone: browserTimeZone }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to request this lesson.');
      updateTimeZone(browserTimeZone);
      setMessage('Booking request sent. The tutor must confirm it.'); setScheduledAt('');
    } catch (error) { setMessage(error.message || 'Unable to request this lesson.'); } finally { setBusy(false); }
  }

  const slots = availability?.slots || [];
  return <div className="mt-5 border-t border-slate-200 pt-4">
    <h3 className="text-sm font-bold text-[#0A1428]">Request a lesson</h3>
    <p className="mt-1 text-xs leading-5 text-slate-600">Times are checked against the tutor’s weekly availability ({availability?.timeZone || 'loading time zone'}). Requests stay pending until the tutor confirms.</p>
    {slots.length ? <ul className="mt-2 space-y-1 text-[11px] text-slate-500">{slots.map((slot, index) => <li key={`${slot.weekday}-${slot.startTime}-${index}`}>{DAYS[slot.weekday]} · {slot.startTime}–{slot.endTime}</li>)}</ul> : <p className="mt-2 text-[11px] text-amber-700">{availability ? 'This tutor has not published weekly availability yet.' : ''}</p>}
    <form onSubmit={submit} className="mt-3 space-y-2">
      <input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} aria-label="Lesson title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
      <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={300} placeholder="Topic (optional)" aria-label="Lesson topic" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
      <input required type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} aria-label="Lesson date and time" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
      <select value={durationMins} onChange={(event) => setDurationMins(event.target.value)} aria-label="Lesson duration" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">{[30, 45, 60, 90, 120, 180].map((duration) => <option key={duration} value={duration}>{duration} minutes</option>)}</select>
      <button disabled={busy || !slots.length} className="w-full btn btn-primary rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50">{busy ? 'Sending…' : user ? 'Request booking' : 'Sign in to request'}</button>
    </form>
    {message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}
  </div>;
}
