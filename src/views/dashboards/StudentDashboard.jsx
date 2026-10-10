'use client';

import React, { useState,useEffect } from 'react';
import { Bell, ArrowRight, Star, Video, CheckCircle2, ChevronRight } from 'lucide-react';

export default function StudentDashboard({ user,onFindTutor, onJoinLesson }) {
  const [selectedProgressWeek, setSelectedProgressWeek] = useState('W5');
  const [nextLesson, setNextLesson] = useState(null);
const [lessonLoading, setLessonLoading] = useState(true);
const [lessonError, setLessonError] = useState('');
const [recommendedTutors, setRecommendedTutors] = useState([]);
const [assignments, setAssignments] = useState([]);
const [assignmentsLoading, setAssignmentsLoading] = useState(true);
const [assignmentsError, setAssignmentsError] = useState('');
const [subjects, setSubjects] = useState([]);
const [subjectsLoading, setSubjectsLoading] = useState(true);
const [subjectsError, setSubjectsError] = useState('');

useEffect(() => {
  let isActive = true;

  async function loadNextLesson() {
    try {
      const response = await fetch('/api/students/lessons', {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not load your next lesson.');
      }

      if (isActive) setNextLesson(result.lesson);
    } catch (error) {
      if (isActive) setLessonError(error.message);
    } finally {
      if (isActive) setLessonLoading(false);
    }
  }

  loadNextLesson();

  return () => {
    isActive = false;
  };
}, []);

  const weeks = [
    { label: 'W1', value: 45 },
    { label: 'W2', value: 58 },
    { label: 'W3', value: 68 },
    { label: 'W4', value: 78 },
    { label: 'W5', value: 92 },
    { label: 'W6', value: 35 },
  ];

  useEffect(() => {
    let isActive = true;
  
    async function loadAssignments() {
      try {
        const response = await fetch('/api/students/assignments', {
          cache: 'no-store',
        });
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Could not load assignments.');
        }
  
        if (isActive) setAssignments(result.assignments);
      } catch (error) {
        if (isActive) setAssignmentsError(error.message);
      } finally {
        if (isActive) setAssignmentsLoading(false);
      }
    }
  
    loadAssignments();
  
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
  
    async function loadSubjects() {
      try {
        const response = await fetch('/api/students/subjects', {
          cache: 'no-store',
        });
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Could not load subjects.');
        }
  
        if (isActive) setSubjects(result.subjects);
      } catch (error) {
        if (isActive) setSubjectsError(error.message);
      } finally {
        if (isActive) setSubjectsLoading(false);
      }
    }
  
    loadSubjects();
  
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
  
    async function loadTutors() {
      try {
        const response = await fetch('/api/tutors', { cache: 'no-store' });
        if (!response.ok) return;
  
        const tutors = await response.json();
        if (!cancelled) setRecommendedTutors(tutors.slice(0, 2));
      } catch {
        // Leave the recommendations empty if the request fails.
      }
    }
  
    loadTutors();
  
    return () => {
      cancelled = true;
    };
  }, []);


  return (
    <div className="space-y-8 animate-fadeIn max-w-[1240px] mx-auto">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#182238] font-normal tracking-tight">
          Welcome back, {user?.name?.split(/\s+/)[0] || 'there'}.
          </h1>
          <p className="text-sm text-slate-500 mt-1">
          You&apos;re building momentum — keep going.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={onFindTutor}
            className="bg-[#E85D4E] hover:bg-[#D54A3B] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
          >
            Find a tutor
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Next Lesson Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
  {lessonLoading ? (
    <p className="text-sm text-slate-500">Loading your next lesson…</p>
  ) : lessonError ? (
    <p role="alert" className="text-sm text-red-600">{lessonError}</p>
  ) : !nextLesson ? (
    <p className="text-sm text-slate-500">No upcoming lessons booked.</p>
  ) : (
    <>
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          Next lesson · {new Date(nextLesson.scheduledAt).toLocaleString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
          {nextLesson.status === 'PENDING' ? 'Pending' : 'Confirmed'}
        </span>
      </div>

      <div className="w-10 h-10 rounded-full bg-[#FCE8E6] text-[#C5221F] flex items-center justify-center font-bold text-xs tracking-wider">
        {nextLesson.tutor.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()}
      </div>

      <div>
        <h2 className="font-serif text-2xl text-[#182238] font-normal">
          {nextLesson.title}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {nextLesson.topic || 'Lesson'} with {nextLesson.tutor.name} ·{' '}
          {nextLesson.durationMins} min
        </p>
      </div>

      <button
        disabled={!nextLesson.meetingUrl}
        onClick={() => onJoinLesson(nextLesson)}
        className="bg-[#E85D4E] hover:bg-[#D54A3B] disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all"
      >
        {nextLesson.meetingUrl ? 'Join lesson' : 'Meeting link pending'}
      </button>
    </>
  )}
</div>

          {/* Middle Row: Learning Progress & Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Learning progress Card */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-[#182238] font-normal">
                    Learning progress
                  </h3>
                  <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                    View report <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Progress Horizontal / Vertical Bars */}
              <div className="space-y-3 pt-2">
                {weeks.map((w) => (
                  <div key={w.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-400 w-6">{w.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          w.label === 'W5' ? 'bg-[#182238]' : 'bg-slate-300'
                        }`}
                        style={{ width: `${w.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments Card */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-xl text-[#182238] font-normal">
                    Assignments
                  </h3>
                  <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                    See all <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-4">
                {assignmentsLoading ? (
  <p className="text-sm text-slate-500">Loading assignments…</p>
) : assignmentsError ? (
  <p role="alert" className="text-sm text-red-600">{assignmentsError}</p>
) : assignments.length === 0 ? (
  <p className="text-sm text-slate-500">No assignments yet.</p>
) : (
  assignments.map((item) => (
    <div key={item.id} className="flex items-start gap-3">
      <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-[#E85D4E]" />
      <div>
        <h4 className="text-sm font-semibold text-[#182238]">{item.title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.status === 'PENDING' ? 'Due ' : ''}
          {new Date(item.dueDate).toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
          {item.status !== 'PENDING' ? ` · ${item.status.toLowerCase()}` : ''}
        </p>
      </div>
    </div>
  ))
)}
                </div>
              </div>
            </div>

          </div>

          {/* Current Subjects Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#182238] font-normal">
                Current subjects
              </h3>
              <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                All subjects <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {subjectsLoading ? (
  <p className="text-sm text-slate-500">Loading subjects…</p>
) : subjectsError ? (
  <p role="alert" className="text-sm text-red-600">{subjectsError}</p>
) : subjects.length === 0 ? (
  <p className="text-sm text-slate-500">No subjects yet.</p>
) : (
  subjects.map((subject) => (
    <div
      key={subject.id}
      className="bg-[#EBF3F9] border-[#D6E6F2] border rounded-2xl p-4 flex flex-col justify-between min-h-[120px]"
    >
      <div>
        <h4 className="font-semibold text-sm text-[#182238]">
          {subject.subjectName}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">{subject.topic}</p>
      </div>
      <div className="mt-4">
        <span className="text-[10px] uppercase font-bold text-slate-500 block">
          Course progress
        </span>
        <span className="text-sm font-bold text-[#182238]">
          {subject.progressPct}%
        </span>
      </div>
    </div>
  ))
)}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recommended Tutors Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#182238] font-normal">
                Recommended tutors
              </h3>
              <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                Browse <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-4">
            {recommendedTutors.length === 0 ? (
  <p className="text-sm text-slate-500">
    Verified tutor recommendations will appear here when available.
  </p>
) : (
              recommendedTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs tracking-wider">
                      {tutor.name.split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#182238]">{tutor.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                      {tutor.subjects[0] || tutor.title || 'Tutor'} · {tutor.rating.toFixed(1)}<span className="text-amber-500">★</span>
                      </p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                    <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              )))}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <h3 className="font-serif text-xl text-[#182238] font-normal">
              Recent activity
            </h3>

            <div>
            <p className="text-sm text-slate-500">
            Lesson and assignment activity will appear here when available.
          </p>
</div>
          </div>

        </div>

      </div>
    </div>
  );
}
