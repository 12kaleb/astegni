'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CalendarClock, CheckCircle2, FileText, MessageSquare, UserRound } from 'lucide-react';
import { useAppShell } from '../../../../components/AppShell';
import TutorStudentChat from '../../../../components/TutorStudentChat';
import LessonSessionView from '../../../../views/LessonSessionView';

function lessonDate(value, timeZone) {
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short', timeZone: timeZone || undefined });
}

export default function TutorStudentWorkspace() {
  const { studentId } = useParams();
  const { user, authLoading, openAuth } = useAppShell();
  const tutorId = user?.id;
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [lessonAssignments, setLessonAssignments] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [curriculumTitle, setCurriculumTitle] = useState('');
  const [curriculumMessage, setCurriculumMessage] = useState('');
  const [curriculumBusy, setCurriculumBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileMessage, setFileMessage] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxScore, setAssignmentMaxScore] = useState('10');
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const curriculumUrl = `/api/conversations/${encodeURIComponent(tutorId)}/curriculum?studentId=${encodeURIComponent(studentId)}`;
    const [lessonsResponse, assignmentsResponse, curriculumResponse] = await Promise.all([
      fetch('/api/tutors/lessons', { cache: 'no-store' }),
      fetch('/api/tutors/assignments', { cache: 'no-store' }),
      fetch(curriculumUrl, { cache: 'no-store' }),
    ]);
    const [lessonData, assignmentData, curriculumData] = await Promise.all([lessonsResponse.json(), assignmentsResponse.json(), curriculumResponse.json()]);
    if (!lessonsResponse.ok) throw new Error(lessonData.error || 'Unable to load the student workspace.');
    if (!assignmentsResponse.ok) throw new Error(assignmentData.error || 'Unable to load assignments.');
    if (!curriculumResponse.ok) throw new Error(curriculumData.error || 'Unable to load the student curriculum.');

    const rosterStudent = (lessonData.students || []).find((item) => item.id === studentId);
    if (!rosterStudent) throw new Error('This student is not on your roster.');
    const studentLessons = [...(lessonData.lessons || []), ...(lessonData.pastLessons || [])]
      .filter((lesson) => lesson.studentId === studentId)
      .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
    const studentAssignments = (assignmentData.assignments || []).filter((item) => item.student?.id === studentId);
    const preferredLesson = studentLessons.find((item) => item.status === 'CONFIRMED')
      || studentLessons.find((item) => item.status === 'COMPLETED')
      || studentLessons[0]
      || null;

    setStudent(rosterStudent);
    setLessons(studentLessons);
    setAssignments(studentAssignments);
    setSelectedLessonId((current) => current && studentLessons.some((lesson) => lesson.id === current) ? current : preferredLesson?.id || null);
    setCurriculum(curriculumData.items || []);
  }, [studentId, tutorId]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role !== 'tutor') {
      setError('Tutor access is required to open this student workspace.');
      setLoading(false);
      return;
    }
    let active = true;
    load().catch((reason) => { if (active) setError(reason.message || 'Unable to load the student workspace.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, load, user]);

  const completedLessons = useMemo(() => lessons.filter((lesson) => lesson.status === 'COMPLETED').length, [lessons]);
  const completedAssignments = useMemo(() => assignments.filter((item) => item.status === 'COMPLETED').length, [assignments]);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  const loadClassroomData = useCallback(async () => {
    if (!selectedLessonId) {
      setLessonAssignments([]);
      return;
    }
    const assignmentsResponse = await fetch(`/api/lessons/${encodeURIComponent(selectedLessonId)}/assignments`, { cache: 'no-store' });
    const assignmentData = await assignmentsResponse.json();
    if (!assignmentsResponse.ok) throw new Error(assignmentData.error || 'Could not load lesson files.');
    setLessonAssignments(assignmentData.assignments || []);
  }, [selectedLessonId]);

  useEffect(() => {
    loadClassroomData().catch((reason) => setCurriculumMessage(reason.message || 'Could not load classroom details.'));
  }, [loadClassroomData]);

  async function addCurriculumItem(event) {
    event.preventDefault();
    if (!curriculumTitle.trim()) return;
    setCurriculumBusy(true);
    setCurriculumMessage('');
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(user.id)}/curriculum?studentId=${encodeURIComponent(studentId)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: curriculumTitle.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not add this lesson.');
      setCurriculumTitle('');
      setCurriculum((current) => [...current, data.item]);
    } catch (reason) {
      setCurriculumMessage(reason.message || 'Could not add this lesson.');
    } finally {
      setCurriculumBusy(false);
    }
  }

  async function toggleCurriculumItem(item) {
    setCurriculumBusy(true);
    setCurriculumMessage('');
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(user.id)}/curriculum?studentId=${encodeURIComponent(studentId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, done: !item.done }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update this lesson.');
      setCurriculum((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !item.done } : entry));
    } catch (reason) {
      setCurriculumMessage(reason.message || 'Could not update this lesson.');
    } finally {
      setCurriculumBusy(false);
    }
  }

  async function uploadAssignmentPdf(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedLessonId) return;
    setFileBusy(true);
    setFileMessage('');
    try {
      const formData = new FormData();
      formData.set('file', file);
      const response = await fetch(`/api/lessons/${encodeURIComponent(selectedLessonId)}/assignments`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not upload this PDF.');
      setAssignments((current) => [data.assignment, ...current.filter((item) => item.id !== data.assignment.id)]);
      await loadClassroomData();
      setFileMessage('PDF added to this student’s assignments.');
    } catch (reason) {
      setFileMessage(reason.message || 'Could not upload this PDF.');
    } finally {
      setFileBusy(false);
    }
  }

  async function createAssignment(event) {
    event.preventDefault();
    if (!assignmentTitle.trim()) return;
    setAssignmentBusy(true);
    setAssignmentMessage('');
    try {
      const response = await fetch('/api/tutors/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          title: assignmentTitle.trim(),
          ...(assignmentDueDate ? { dueDate: assignmentDueDate } : {}),
          maxScore: Number(assignmentMaxScore) || 10,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create this assignment.');
      setAssignments((current) => [data.assignment, ...current]);
      setAssignmentTitle('');
      setAssignmentDueDate('');
      setAssignmentMessage('Homework assigned.');
    } catch (reason) {
      setAssignmentMessage(reason.message || 'Could not create this assignment.');
    } finally {
      setAssignmentBusy(false);
    }
  }

  if (authLoading || loading) return <div role="status" className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">Loading student workspace…</div>;
  if (!user) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><p className="text-slate-600">Sign in to open this student workspace.</p><button onClick={() => openAuth('signin')} className="btn btn-primary mt-4 px-5 py-2">Sign in</button></div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><Link href="/dashboard" className="text-sm text-slate-600">← Tutor dashboard</Link><p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p></div>;

  return <main className="min-h-screen bg-[#FAF7F2] pb-12">
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0A1428]"><ArrowLeft className="h-4 w-4" />Tutor dashboard</Link>

      <section className="mt-5 rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E05A47]/10 text-[#E05A47]"><UserRound className="h-7 w-7" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E05A47]">Student workspace</p>
            <h1 className="mt-1 font-serif text-2xl text-[#0A1428] sm:text-3xl">{student?.name}</h1>
            <p className="mt-1 text-xs text-slate-500">{student?.email}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: CalendarClock, label: 'Lessons', value: lessons.length },
            { icon: CheckCircle2, label: 'Completed lessons', value: completedLessons },
            { icon: FileText, label: 'Assignments', value: assignments.length },
            { icon: BookOpen, label: 'Completed assignments', value: completedAssignments },
          ].map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl bg-[#FAF7F2] p-4"><Icon className="h-4 w-4 text-[#E05A47]" /><p className="mt-3 text-xl font-bold text-[#0A1428]">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div>)}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border-2 border-[#E05A47]/30 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#E05A47]">Start here</p>
            <h2 className="mt-1 flex items-center gap-2 font-serif text-xl text-[#0A1428]"><BookOpen className="h-5 w-5 text-[#E05A47]" />Build the student’s curriculum</h2>
            <p className="mt-1 text-xs text-slate-500">Add the topics you’ll teach, then check them off as the student learns.</p>
          </div>
          <span className="rounded-full bg-[#FFF3EF] px-3 py-1 text-[10px] font-bold text-[#C94635]">{curriculum.filter((item) => item.done).length}/{curriculum.length} complete</span>
        </div>
        <form onSubmit={addCurriculumItem} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input autoFocus value={curriculumTitle} onChange={(event) => setCurriculumTitle(event.target.value)} maxLength={500} placeholder="Add the first lesson topic or learning goal" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[#E05A47] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/20" />
          <button disabled={curriculumBusy || !curriculumTitle.trim()} className="rounded-xl bg-[#E05A47] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{curriculumBusy ? 'Saving…' : 'Add to curriculum'}</button>
        </form>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {!curriculum.length && <p className="rounded-xl bg-[#FAF7F2] p-3 text-xs text-slate-500 sm:col-span-2">No topics yet. Start with what the student wants to achieve.</p>}
          {curriculum.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-xl bg-[#FAF7F2] p-3 text-xs text-[#0A1428]"><input type="checkbox" checked={item.done} disabled={curriculumBusy} onChange={() => toggleCurriculumItem(item)} className="mt-0.5 accent-[#E05A47]" /><span className={item.done ? 'line-through text-slate-400' : ''}>{item.text}</span></label>)}
        </div>
        {curriculumMessage && <p role="status" className="mt-3 text-xs text-rose-700">{curriculumMessage}</p>}
      </section>

      <div className="mt-6">
        <TutorStudentChat tutorId={user.id} studentId={studentId} user={user} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#E05A47]" /><h2 className="font-bold text-[#0A1428]">Lesson history</h2></div>
            <div className="mt-4 space-y-2">
              {lessons.length === 0 && <p className="text-xs text-slate-500">No lessons have been booked yet.</p>}
              {lessons.map((lesson) => <button key={lesson.id} onClick={() => setSelectedLessonId(lesson.id)} className={`w-full rounded-xl border p-3 text-left ${selectedLessonId === lesson.id ? 'border-[#E05A47] bg-[#FFF6F3]' : 'border-slate-200 hover:bg-slate-50'}`}>
                <span className="block truncate text-xs font-bold text-[#0A1428]">{lesson.title}</span>
                <span className="mt-1 block text-[10px] text-slate-500">{lessonDate(lesson.scheduledAt, user.timeZone)}</span>
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">{lesson.status}</span>
              </button>)}
            </div>
          </section>
          <section className="rounded-3xl border border-[#EAE6DF] bg-white p-5">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#E05A47]" /><h2 className="font-bold text-[#0A1428]">Assignments &amp; homework</h2></div>
            <form onSubmit={createAssignment} className="mt-4 space-y-2">
              <label className="block text-[10px] font-semibold text-slate-600">Homework title
                <input required maxLength={150} value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} placeholder="e.g. Algebra practice" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
              </label>
              <label className="block text-[10px] font-semibold text-slate-600">Due date (optional)
                <input type="date" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
              </label>
              <label className="block text-[10px] font-semibold text-slate-600">Points
                <input type="number" min="1" max="1000" value={assignmentMaxScore} onChange={(event) => setAssignmentMaxScore(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
              </label>
              <button disabled={assignmentBusy || !assignmentTitle.trim()} className="w-full rounded-lg bg-[#0A1428] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{assignmentBusy ? 'Assigning…' : 'Assign homework'}</button>
              {assignmentMessage && <p role="status" className="text-[10px] text-slate-600">{assignmentMessage}</p>}
            </form>
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-3">
              <label className={`block text-xs font-bold text-[#0A1428] ${fileBusy || !selectedLesson || !['CONFIRMED', 'COMPLETED'].includes(selectedLesson.status) ? 'opacity-50' : 'cursor-pointer'}`}>
                {fileBusy ? 'Uploading PDF…' : 'Upload assignment PDF'}
                <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={fileBusy || !selectedLesson || !['CONFIRMED', 'COMPLETED'].includes(selectedLesson.status)} onChange={uploadAssignmentPdf} />
              </label>
              <p className="mt-1 text-[10px] text-slate-500">Share a PDF with the student · 8 MB maximum.</p>
              {fileMessage && <p role="status" className="mt-2 text-[10px] text-slate-600">{fileMessage}</p>}
            </div>
            <div className="mt-4 space-y-2">
              {!assignments.length && <p className="text-xs text-slate-500">No homework assigned yet.</p>}
              {assignments.map((item) => <div key={item.id} className="rounded-xl bg-[#FAF7F2] p-3"><p className="text-xs font-semibold text-[#0A1428]">{item.title}</p><p className="mt-1 text-[10px] text-slate-500">{item.status} · Due {lessonDate(item.dueDate, user.timeZone)}</p><p className="mt-1 text-[10px] text-slate-500">Score: {item.score == null ? 'Not graded' : `${item.score}/${item.maxScore || 10}`}</p></div>)}
            </div>
            <div className="mt-3 space-y-2">
              {lessonAssignments.filter((item) => item.fileName).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3"><span className="truncate text-[10px] font-semibold text-[#0A1428]">{item.fileName}</span>{item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-bold text-[#E05A47] underline">Open PDF</a>}</div>)}
            </div>
          </section>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] p-5">
            <div><h2 className="flex items-center gap-2 font-bold text-[#0A1428]"><MessageSquare className="h-4 w-4 text-[#E05A47]" />Classroom</h2><p className="mt-1 text-xs text-slate-500">Lesson materials and private messages with {student?.name}.</p></div>
            {selectedLesson && <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">{selectedLesson.status}</span>}
          </div>
          {selectedLesson && ['CONFIRMED', 'COMPLETED'].includes(selectedLesson.status) ? (
            <LessonSessionView key={selectedLesson.id} lessonId={selectedLesson.id} user={user} />
          ) : selectedLesson ? (
            <div className="p-8 text-center"><p className="font-semibold text-[#0A1428]">This lesson is awaiting confirmation.</p><p className="mt-2 text-xs text-slate-500">The classroom and messaging will open once the booking is confirmed.</p></div>
          ) : (
            <div className="p-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-[#0A1428]">No classroom yet</p><p className="mt-2 text-xs text-slate-500">When this student books a lesson with you, chat, assignments, and PDFs will be available here.</p></div>
          )}
        </section>
      </div>
    </div>
  </main>;
}
