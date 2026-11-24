'use client';

import { useEffect, useState } from 'react';
import { useAppShell } from '../../../components/AppShell';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function zonedDateTimeToIso(year, month, day, minute, timeZone) {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  const target = Date.UTC(year, month - 1, day, hour, min);
  let timestamp = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(timestamp));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
    const represented = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute);
    timestamp += target - represented;
  }
  return new Date(timestamp).toISOString();
}

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
  const timeOptions = [];
  if (availability?.timeZone) {
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: availability.timeZone, weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    for (let offset = 0; offset < 45; offset += 1) {
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset, 12));
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: availability.timeZone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(day);
      const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
      const weekday = DAYS.findIndex((name) => name.startsWith(values.weekday));
      for (const slot of slots.filter((item) => item.weekday === weekday)) {
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        for (let minute = start; minute + Number(durationMins) <= end; minute += 30) {
          const iso = zonedDateTimeToIso(Number(values.year), Number(values.month), Number(values.day), minute, availability.timeZone);
          if (new Date(iso) > now) timeOptions.push({ iso, label: `${dateFormatter.format(day)} · ${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}` });
        }
      }
    }
  }
  return <div className="mt-5 border-t border-slate-200 pt-4">
    <h3 className="text-sm font-bold text-[#0A1428]">Request a lesson</h3>
    <p className="mt-1 text-xs leading-5 text-slate-600">Times are checked against the tutor’s weekly availability ({availability?.timeZone || 'loading time zone'}). Requests stay pending until the tutor confirms.</p>
    {!slots.length && availability && <p className="mt-2 text-[11px] text-amber-700">This tutor has not published weekly availability yet.</p>}
    <form onSubmit={submit} className="mt-3 space-y-2">
      <input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} aria-label="Lesson title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
      <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={300} placeholder="Topic (optional)" aria-label="Lesson topic" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
      <select value={durationMins} onChange={(event) => { setDurationMins(event.target.value); setScheduledAt(''); }} aria-label="Lesson duration" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">{[30, 45, 60, 90, 120, 180].map((duration) => <option key={duration} value={duration}>{duration} minutes</option>)}</select>
      <select required value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} aria-label="Choose an available lesson time" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">
        <option value="">Choose an available time</option>
        {timeOptions.map((option) => <option key={option.iso} value={option.iso}>{option.label} ({availability?.timeZone})</option>)}
      </select>
      {!timeOptions.length && slots.length > 0 && <p className="text-[11px] text-amber-700">No upcoming times fit this lesson length. Try a shorter duration.</p>}
      <button disabled={busy || !scheduledAt} className="w-full btn btn-primary rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50">{busy ? 'Sending…' : user ? 'Request booking' : 'Sign in to request'}</button>
    </form>
    {message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}
  </div>;
}
