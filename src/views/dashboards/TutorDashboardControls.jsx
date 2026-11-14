'use client';

import { Calendar, FileText, LayoutDashboard, MessageSquare, Users } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Dashboard Overview', Icon: LayoutDashboard },
  { id: 'schedule', label: 'Teaching Schedule', Icon: Calendar, countKey: 'lessons' },
  { id: 'students', label: 'Student Roster', Icon: Users, countKey: 'students' },
  { id: 'assignments', label: 'Assignments Given', Icon: FileText, countKey: 'assignments' },
  { id: 'messages', label: 'Student Messages', Icon: MessageSquare },
];

export function TutorDashboardTabs({ activeTab, setActiveTab, lessons, students, assignments }) {
  const counts = { lessons: lessons.length, students: students.length, assignments: assignments.length };
  return (
    <nav aria-label="Tutor dashboard" className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#EAE6DF] scrollbar-none">
      {tabs.map(({ id, label, Icon, countKey }) => (
        <button key={id} type="button" aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A1428] ${activeTab === id ? 'bg-[#0A1428] text-white shadow-xs' : 'text-slate-700 hover:text-[#0A1428] hover:bg-white/60'}`}>
          <Icon aria-hidden="true" className="w-3.5 h-3.5" />
          <span>{label}</span>
          {countKey && <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">{counts[countKey]}</span>}
        </button>
      ))}
    </nav>
  );
}

export function TutorDashboardMetrics({ lessons, lessonsLoading, lessonCount, students, activeStudentCount, displayLessonValue, hoursTaughtMonth, profile }) {
  const nextLesson = lessons[0];
  return (
    <section aria-label="Tutor performance" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric label="Upcoming Lessons" value={lessonsLoading ? '—' : lessonCount} detail={nextLesson ? `Next: ${new Date(nextLesson.scheduledAt).toLocaleString()}` : 'No sessions scheduled'} />
      <Metric label="Active Students" value={lessonsLoading ? '—' : activeStudentCount} detail={lessonsLoading ? 'Loading students' : `${students.length} enrolled`} />
      <Metric label="This Month’s Completed Lesson Value" value={lessonsLoading ? '—' : displayLessonValue} detail={`Estimated from ${hoursTaughtMonth} completed hours × current listed rate. Payments are not tracked yet.`} />
      <Metric label="Educator Rating" value={<>{profile?.rating?.toFixed(1) || '—'}{profile?.reviewsCount > 0 && profile?.rating != null ? ' ★' : ''}</>} detail={profile?.reviewsCount > 0 ? `${profile.reviewsCount} reviews` : 'No reviews yet'} />
    </section>
  );
}

function Metric({ label, value, detail }) {
  return <article className="min-w-0 bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-sm flex flex-col justify-between">
    <h2 className="text-xs text-slate-600 font-medium">{label}</h2>
    <p className="text-3xl font-serif text-[#182238] my-1">{value}</p>
    <p className="text-[11px] text-slate-600">{detail}</p>
  </article>;
}
