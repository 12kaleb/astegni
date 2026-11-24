'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function TutorStudentCurriculum({ tutorId, studentId }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const response = await fetch(`/api/conversations/${encodeURIComponent(tutorId)}/curriculum?studentId=${encodeURIComponent(studentId)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load the tutor lesson plan.');
    setItems(data.items || []);
  }, [studentId, tutorId]);

  useEffect(() => {
    let active = true;
    load().catch((reason) => { if (active) setError(reason.message || 'Could not load the tutor lesson plan.'); });
    const interval = setInterval(() => load().catch((reason) => { if (active) setError(reason.message || 'Could not refresh the tutor lesson plan.'); }), 5000);
    return () => { active = false; clearInterval(interval); };
  }, [load]);

  return <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5">
    <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#E05A47]" /><h3 className="font-bold text-[#0A1428]">Your tutor’s lesson plan</h3></div>
    <div className="mt-3 space-y-2">
      {!items.length && !error && <p className="text-xs text-slate-500">Your tutor will add lesson topics after learning about your goals.</p>}
      {items.map((item) => <div key={item.id} className="flex items-start gap-2 rounded-xl bg-[#FAF7F2] p-3 text-xs"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>{item.done ? '✓' : ''}</span><span className={item.done ? 'text-slate-400 line-through' : 'text-[#0A1428]'}>{item.text}</span></div>)}
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    </div>
  </section>;
}
