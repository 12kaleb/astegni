'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppShell } from '../../components/AppShell';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TutorAvailabilitySettings() {
  const { updateTimeZone } = useAppShell();
  const [timeZone, setTimeZone] = useState('Africa/Addis_Ababa');
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch('/api/tutors/availability', { cache: 'no-store' });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to load availability.');
    setTimeZone(result.timeZone); setSlots(result.slots || []);
  }, []);
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [load]);
  function change(index, key, value) { setSlots((current) => current.map((slot, i) => i === index ? { ...slot, [key]: value } : slot)); }
  async function save() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/tutors/availability', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeZone, slots }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to save availability.');
      updateTimeZone(result.timeZone);
      setMessage('Weekly availability saved.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="font-bold text-[#0A1428]">Weekly availability</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">Choose the time zone these recurring windows use. Students can request lessons only inside an available window.</p>
    <label className="mt-3 block text-xs font-semibold">IANA time zone<input value={timeZone} onChange={(event) => setTimeZone(event.target.value)} placeholder="Africa/Addis_Ababa" className="mt-1 block w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2" /></label>
    <div className="mt-4 space-y-2">{slots.map((slot, index) => <div key={`${slot.weekday}-${index}`} className="flex flex-wrap items-center gap-2">
      <select aria-label="Day of week" value={slot.weekday} onChange={(event) => change(index, 'weekday', Number(event.target.value))} className="rounded-lg border border-slate-300 px-2 py-2 text-xs">{DAYS.map((day, weekday) => <option key={day} value={weekday}>{day}</option>)}</select>
      <input aria-label="Availability starts" type="time" value={slot.startTime} onChange={(event) => change(index, 'startTime', event.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs" />
      <span className="text-xs">to</span>
      <input aria-label="Availability ends" type="time" value={slot.endTime} onChange={(event) => change(index, 'endTime', event.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs" />
      <button onClick={() => setSlots((current) => current.filter((_, i) => i !== index))} className="text-xs text-rose-700 underline">Remove</button>
    </div>)}
    {!slots.length && <p className="text-xs text-slate-500">No weekly windows added yet.</p>}</div>
    <div className="mt-4 flex gap-2"><button disabled={slots.length >= 28} onClick={() => setSlots((current) => [...current, { weekday: 1, startTime: '09:00', endTime: '10:00' }])} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40">Add time window</button><button disabled={busy} onClick={save} className="btn btn-primary rounded-lg px-4 py-2 text-xs font-bold">{busy ? 'Saving…' : 'Save availability'}</button></div>
    {message && <p role="status" className="mt-3 text-xs text-slate-600">{message}</p>}
  </section>;
}
