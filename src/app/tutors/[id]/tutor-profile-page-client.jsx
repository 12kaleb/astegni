'use client';

import Link from 'next/link';
import { Award, BookOpen, CheckCircle, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useAppShell } from '../../../components/AppShell';
import { useState } from 'react';
import Image from 'next/image';
import LessonBookingRequest from './lesson-booking-request';

export default function TutorProfilePageClient({ tutor }) {
  const { selectTutor, selectedTutorIds, selectingTutorId, user, openAuth } = useAppShell();
  const [reporting, setReporting] = useState(false);
  const [reportDetails, setReportDetails] = useState('');
  const [safetyMessage, setSafetyMessage] = useState('');
  const [safetyBusy, setSafetyBusy] = useState(false);
  const isSelected = selectedTutorIds.includes(tutor.id);
  const isSelecting = selectingTutorId === tutor.id;
  const rate = tutor.hourlyRateETB == null ? 'Rate not listed' : `${Number(tutor.hourlyRateETB).toLocaleString()} ETB`;

  async function submitReport() {
    setSafetyBusy(true); setSafetyMessage('');
    try {
      const response = await fetch('/api/safety/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportedUserId: tutor.userId, category: 'OTHER', details: reportDetails }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to report this account.');
      setReportDetails(''); setReporting(false); setSafetyMessage('Report submitted for review.');
    } catch (error) { setSafetyMessage(error.message); } finally { setSafetyBusy(false); }
  }

  async function blockTutor() {
    if (!window.confirm('Block this tutor? You will not be able to select them or schedule lessons.')) return;
    setSafetyBusy(true); setSafetyMessage('');
    try {
      const response = await fetch('/api/safety/blocks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: tutor.userId }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to block this account.');
      setSafetyMessage('Tutor blocked.');
    } catch (error) { setSafetyMessage(error.message); } finally { setSafetyBusy(false); }
  }

  return (
    <article className="container max-w-5xl py-8 md:py-12">
      <Link href="/tutors" className="text-sm font-semibold text-[#E05A47] hover:underline">← Browse tutors</Link>
      <div className="mt-5 overflow-hidden rounded-3xl border border-[#E8E2D8] bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-[#0A1428] to-[#1E3352]" />
        <div className="px-6 pb-8 md:px-10">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {tutor.avatar ? (
                <Image src={tutor.avatar} alt={tutor.name} width={96} height={96} className="h-24 w-24 rounded-2xl bg-white object-cover shadow-xl ring-4 ring-white" />
              ) : (
                <div aria-label={`${tutor.name} avatar`} className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#0A1428] text-3xl font-bold text-white shadow-xl ring-4 ring-white">{tutor.name?.charAt(0) || 'T'}</div>
              )}
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#0A1428] md:text-3xl">{tutor.name}</h1>
                  <CheckCircle aria-label="Verified tutor" className="h-5 w-5 shrink-0 text-emerald-500" />
                </div>
                <p className="mt-1 text-sm font-semibold text-[#E05A47]">{tutor.title || 'Verified Astegni Tutor'}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8E2D8] bg-[#FAF7F2] px-5 py-3 sm:text-right">
              <span className="block text-[10px] font-bold text-slate-400">HOURLY RATE</span>
              <span className="text-xl font-extrabold text-[#E05A47]">{rate}</span>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-b border-slate-100 pb-6 text-sm text-slate-600">
            {tutor.reviewsCount > 0 && tutor.rating != null && <span className="inline-flex items-center gap-1 text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{tutor.rating} ({tutor.reviewsCount} reviews)</span>}
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-[#E05A47]" />{tutor.university || 'Education not provided'}</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4 text-[#E05A47]" />{tutor.experienceYears == null ? 'Experience not provided' : `${tutor.experienceYears} years experience`}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#E05A47]" />{tutor.location || 'Location not provided'}</span>
          </div>

          <div className="grid gap-8 pt-7 md:grid-cols-[1fr_280px]">
            <div className="space-y-7">
              <section>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0A1428]">About this tutor</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{tutor.bio || 'This tutor has not added a biography yet.'}</p>
              </section>
              <section>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0A1428]">Teaching subjects</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(tutor.subjects || []).length ? tutor.subjects.map((subject) => <span key={subject} className="rounded-lg border border-[#E8E2D8] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#0A1428]">{subject}</span>) : <p className="text-sm text-slate-500">Subjects not listed.</p>}
                </div>
              </section>
              <section>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0A1428]">Languages and session options</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {(tutor.languages || []).map((language) => <span key={language} className="rounded-lg bg-slate-100 px-3 py-1.5">{language}</span>)}
                  {(tutor.modes || []).map((mode) => <span key={mode} className="rounded-lg bg-slate-100 px-3 py-1.5">{mode}</span>)}
                  {(tutor.gradeLevels || []).map((level) => <span key={level} className="rounded-lg bg-slate-100 px-3 py-1.5">{level}</span>)}
                  {!(tutor.languages?.length || tutor.modes?.length || tutor.gradeLevels?.length) && <span>Not provided yet.</span>}
                </div>
              </section>
              <section>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0A1428]">Student reviews</h2>
                <div className="mt-3 space-y-3">
                  {tutor.reviews?.length ? tutor.reviews.map((review) => (
                    <article key={review.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-sm text-[#0A1428]">{review.studentName}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{review.rating}/5</span>
                      </div>
                      {review.comment && <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>}
                    </article>
                  )) : <p className="text-sm text-slate-500">No student reviews yet.</p>}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-[#E8E2D8] bg-[#FAF7F2] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><ShieldCheck className="h-4 w-4" />Verified Astegni educator</div>
              <p className="mt-3 text-xs leading-5 text-slate-600">Select this tutor to let them know you are interested. You can continue the conversation from your dashboard.</p>
              <button
                onClick={() => selectTutor(tutor)}
                disabled={isSelected || isSelecting}
                aria-pressed={isSelected}
                className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed ${isSelected ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'btn btn-primary'}`}
              >
                {isSelected ? 'Selected' : isSelecting ? 'Selecting…' : 'Select this tutor'}
              </button>
              <LessonBookingRequest tutorProfileId={tutor.id} />
              {user && ['student', 'tutor'].includes(user.role) && user.role !== 'tutor' && <div className="mt-4 border-t border-slate-200 pt-4">
                {!reporting ? <button disabled={safetyBusy} onClick={() => setReporting(true)} className="mr-4 text-xs font-semibold text-slate-600 underline">Report this tutor</button> : <div className="space-y-2">
                  <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={3000} minLength={10} placeholder="Describe the safety concern (10–3000 characters)." className="w-full rounded-lg border border-slate-300 p-2 text-xs" />
                  <button disabled={safetyBusy || reportDetails.trim().length < 10} onClick={submitReport} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Submit report</button>
                  <button onClick={() => setReporting(false)} className="ml-2 text-xs underline">Cancel</button>
                </div>}
                <button disabled={safetyBusy} onClick={() => user ? blockTutor() : openAuth('signin')} className="text-xs font-semibold text-slate-600 underline">Block this tutor</button>
                {safetyMessage && <p role="status" className="mt-2 text-xs text-slate-600">{safetyMessage}</p>}
              </div>}
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}
