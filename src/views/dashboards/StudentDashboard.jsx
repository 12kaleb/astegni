'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SUBJECT_GROUPS } from '../../lib/subject-catalog';
import TutorStudentChat from '../../components/TutorStudentChat';
import TutorStudentCurriculum from '../../components/TutorStudentCurriculum';
import {
  Bell,
  ArrowRight,
  Star,
  Video,
  CheckCircle2,
  Circle,
  ChevronRight,
  BookOpen,
  Clock,
  Calendar,
  Check,
  Plus,
  MessageSquare,
  Send,
  Sparkles,
  Filter,
  X,
  ExternalLink,
  Award,
  FileText,
  BarChart3,
  User,
  ShieldCheck,
  LayoutDashboard,
  CheckCheck
} from 'lucide-react';

function formatLessonTime(value, timeZone, options) {
  const zone = timeZone || 'Africa/Addis_Ababa';
  return `${new Date(value).toLocaleString([], { ...options, timeZone: zone })} (${zone})`;
}


export default function StudentDashboard({
  user,
  onFindTutor = () => {},
  onSelectTutor = () => {},
  selectedTutorIds = [],
  onJoinLesson = () => {},
}) {
  // Navigation tabs within student dashboard
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'schedule' | 'assignments' | 'subjects' | 'messages'

  // Data states
  const [nextLesson, setNextLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [lessonError, setLessonError] = useState('');
  const [payingLessonId, setPayingLessonId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [reviewableLessons, setReviewableLessons] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewMessage, setReviewMessage] = useState('');

  const [recommendedTutors, setRecommendedTutors] = useState([]);
  const [chatTutors, setChatTutors] = useState([]);
  const [maxTutorRate, setMaxTutorRate] = useState(1000);
  const affordableRecommendedTutors = recommendedTutors
    .filter((tutor) => {
      if (tutor.hourlyRateETB == null) return true;
      const rate = Number(tutor.hourlyRateETB);
      return Number.isFinite(rate) && rate >= 0 && rate <= maxTutorRate;
    })
    .slice(0, 3);

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState('');

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  // Notifications dropdown state
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Modals state
  const [selectedAssignmentModal, setSelectedAssignmentModal] = useState(null);
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTopic, setNewSubjectTopic] = useState('');

  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/students/tutors', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load tutor conversations.');
        return result;
      })
      .then((result) => { if (active) setChatTutors(Array.isArray(result.tutors) ? result.tutors : []); })
      .catch((error) => { if (active) setSubjectsError(error.message); });
    return () => { active = false; };
  }, []);

  async function startLessonPayment(lesson) {
    setPayingLessonId(lesson.id);
    setPaymentError('');
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id, currency: 'ETB' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to start checkout.');
      window.location.assign(result.payment.checkoutUrl);
    } catch (error) {
      setPaymentError(error.message);
      setPayingLessonId(null);
    }
  }

  async function submitLessonReview(lessonId) {
    const draft = reviewDrafts[lessonId] || { rating: 5, comment: '' };
    setReviewMessage('');
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit review.');
      setReviewableLessons((lessons) => lessons.filter((lesson) => lesson.id !== lessonId));
      setReviewMessage('Your review was submitted.');
    } catch (error) {
      setReviewMessage(error.message);
    }
  }

  // 1. Fetch Next Lesson
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

        if (isActive) {
          setNextLesson(result.lesson || null);
          setAllLessons(Array.isArray(result.lessons) ? result.lessons : result.lesson ? [result.lesson] : []);
        }
      } catch (error) {
        if (isActive) setLessonError(error.message || 'Could not load your lessons.');
      } finally {
        if (isActive) setLessonLoading(false);
      }
    }

    loadNextLesson();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    fetch('/api/students/reviews', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load reviews.');
        if (isActive) setReviewableLessons(Array.isArray(result.lessons) ? result.lessons : []);
      })
      .catch((error) => { if (isActive) setReviewMessage(error.message); });
    return () => { isActive = false; };
  }, []);

  // 2. Fetch Assignments
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

        if (isActive) setAssignments(Array.isArray(result.assignments) ? result.assignments : []);
      } catch (error) {
        if (isActive) setAssignmentsError(error.message || 'Could not load assignments.');
      } finally {
        if (isActive) setAssignmentsLoading(false);
      }
    }

    loadAssignments();
    return () => {
      isActive = false;
    };
  }, []);

  // 3. Fetch Subjects
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

        if (isActive) setSubjects(Array.isArray(result.subjects) ? result.subjects : []);
      } catch (error) {
        if (isActive) setSubjectsError(error.message || 'Could not load subjects.');
      } finally {
        if (isActive) setSubjectsLoading(false);
      }
    }

    loadSubjects();
    return () => {
      isActive = false;
    };
  }, []);

  // 4. Fetch Recommended Tutors
  useEffect(() => {
    let cancelled = false;

    async function loadTutors() {
      try {
        const response = await fetch('/api/tutors', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) setRecommendedTutors([]);
          return;
        }

        const result = await response.json();
        const tutors = result.tutors;
        if (!cancelled) {
          if (Array.isArray(tutors) && tutors.length > 0) {
            setRecommendedTutors(tutors);
          } else {
            setRecommendedTutors([]);
          }
        }
      } catch (error) {
        console.error('[student dashboard] tutor recommendations failed:', error);
        if (!cancelled) setRecommendedTutors([]);
      }
    }

    loadTutors();
    return () => {
      cancelled = true;
    };
  }, []);

  // 5. Fetch Recent Activity
  useEffect(() => {
    let isActive = true;

    async function loadActivity() {
      try {
        const response = await fetch('/api/students/activity', {
          cache: 'no-store',
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Could not load recent activity.');
        }

        if (isActive) setActivity(Array.isArray(result.activity) ? result.activity : []);
      } catch (error) {
        if (isActive) setActivityError(error.message || 'Could not load recent activity.');
      } finally {
        if (isActive) setActivityLoading(false);
      }
    }

    loadActivity();
    return () => {
      isActive = false;
    };
  }, []);

  // Calculate overall progress across subjects
  const overallProgress = subjects.length
    ? Math.round(
        subjects.reduce((total, subject) => total + (subject.progressPct || 0), 0) /
          subjects.length
      )
    : 0;

  // Toggle Assignment completion status
  const handleToggleAssignment = async (item) => {
    const updatedStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const response = await fetch('/api/students/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: updatedStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update assignment.');
      setAssignments((prev) => prev.map((a) => a.id === item.id ? { ...a, ...result.assignment } : a));
    } catch (error) {
      setAssignmentsError(error.message || 'Could not update assignment.');
    }
  };

  // Add new subject handler
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const response = await fetch('/api/students/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: newSubjectName,
          topic: newSubjectTopic,
          progressPct: 0,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not add subject.');
      setSubjects((prev) => [...prev, result.subject]);
      setAddSubjectModalOpen(false);
      setNewSubjectName('');
      setNewSubjectTopic('');
    } catch (error) {
      setSubjectsError(error.message || 'Could not add subject.');
    }
  };

  // Add new task / assignment handler
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/students/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          dueDate: newTaskDueDate || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not add assignment.');
      setAssignments((prev) => [result.assignment, ...prev]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setAddTaskModalOpen(false);
    } catch (error) {
      setAssignmentsError(error.message || 'Could not add assignment.');
    }
  };

  const studentFirstName = user?.name?.split(/\s+/)[0] || 'there';

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1240px] mx-auto pb-12">
      {/* 1. TOP HEADER & GREETING BAR */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E05A47]/10 text-[#E05A47] font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Learning Portal</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#182238] font-normal tracking-tight">
            Welcome back, {studentFirstName}.
          </h1>
          <p className="text-sm text-slate-500">
            Your learning activity and upcoming lessons are shown below.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
              }}
              className="w-10 h-10 rounded-full border border-slate-200 bg-[#FAF7F2] flex items-center justify-center text-slate-600 hover:text-[#0A1428] hover:border-slate-300 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Notifications Dropdown Menu */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-[#EAE6DF] shadow-xl p-4 z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-[#0A1428] uppercase tracking-wider">
                    Notifications
                  </h4>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  <p className="p-2.5 text-xs text-slate-500">Notifications are not available yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Find a Tutor Button */}
          <button
            onClick={onFindTutor}
            className="btn btn-primary px-6 py-2.5 text-xs font-bold shadow-md shadow-[#E05A47]/20 flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Find a Tutor</span>
          </button>
        </div>
      </div>

      {(lessonError || assignmentsError || subjectsError || activityError) && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {[lessonError, assignmentsError, subjectsError, activityError].filter(Boolean).join(' ')}
        </div>
      )}

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#EAE6DF] scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-[#0A1428] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0A1428] hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'schedule'
              ? 'bg-[#0A1428] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0A1428] hover:bg-white/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled Lessons</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E05A47] text-white text-[10px]">
            {allLessons.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'assignments'
              ? 'bg-[#0A1428] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0A1428] hover:bg-white/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Assignments & Tests</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
            {assignments.filter((a) => a.status === 'PENDING').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'subjects'
              ? 'bg-[#0A1428] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0A1428] hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Subjects & Progress</span>
        </button>

        <button
          onClick={() => setActiveSubTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'messages'
              ? 'bg-[#0A1428] text-white shadow-xs'
              : 'text-slate-600 hover:text-[#0A1428] hover:bg-white/60'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Tutor Messages</span>
        </button>
      </div>

      {/* 3. METRIC QUICK STATS SUMMARY TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Active Subjects</span>
            <span className="text-xl font-bold text-[#0A1428]">{subjects.length} Enrolled</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tracked Study Hours</span>
            <span className="text-xl font-bold text-[#0A1428]">Not tracked</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E05A47] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Upcoming Lessons</span>
            <span className="text-xl font-bold text-[#0A1428]">
              {allLessons.length} Scheduled
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Subject Progress</span>
            <span className="text-xl font-bold text-emerald-600">{subjects.length ? `${overallProgress}% Average` : 'No subjects yet'}</span>
          </div>
        </div>
      </div>

      {/* 4. TAB VIEW 1: OVERVIEW (Main Figma Dashboard Layout) */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLUMNS */}
          <div className="lg:col-span-8 space-y-6">
            {/* A. NEXT UPCOMING LESSON CARD (Figma Hero Banner) */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    Next lesson ·{' '}
                    {lessonLoading ? 'Loading lesson…' : nextLesson
                      ? formatLessonTime(nextLesson.scheduledAt, user?.timeZone, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'No upcoming lesson'}
                  </span>
                </div>

                {nextLesson && <span className="bg-[#E8F5E9] text-[#2E7D32] px-3 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1"><Check className="w-3 h-3" /><span>{nextLesson.status}</span></span>}
              </div>

              {/* Tutor info & Lesson subject */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${nextLesson ? 'bg-slate-100' : 'bg-[#E05A47]/10'}`}>
                    {nextLesson ? <User className="w-5 h-5 text-slate-400" /> : <Calendar className="w-5 h-5 text-[#E05A47]" />}
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-[#182238] font-normal leading-tight">
                      {lessonLoading ? 'Loading your next lesson…' : nextLesson?.title || 'No upcoming lesson'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-[#0A1428]">
                        {nextLesson?.tutor?.name || 'Tutor not assigned'}
                      </span>
                      {nextLesson?.topic && <><span>·</span><span>{nextLesson.topic}</span></>}
                      {nextLesson?.durationMins != null && <span>·</span>}
                      {nextLesson?.durationMins != null && <span>{nextLesson.durationMins} mins</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {nextLesson && nextLesson.meetingUrl ? (
                  <a
                    href={`/lessons/${nextLesson.id}`}
                    className="btn btn-primary px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#E05A47]/20 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Session Room</span>
                  </a>
                ) : (
                  <button
                    onClick={() => nextLesson ? onJoinLesson(nextLesson) : onFindTutor()}
                    disabled={Boolean(nextLesson && !nextLesson.meetingUrl)}
                    className="btn btn-primary px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-[#E05A47]/20 flex items-center gap-2"
                  >
                    {nextLesson ? <Video className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span>{nextLesson ? (nextLesson.status === 'PENDING' ? 'Awaiting tutor confirmation' : 'Meeting link unavailable') : 'Find a tutor'}</span>
                  </button>
                )}

                {nextLesson && <button
                  onClick={() => setActiveSubTab('messages')}
                  className="btn btn-outline px-4 py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#E05A47] flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Tutor</span>
                </button>}

                <button
                  onClick={() => setActiveSubTab('schedule')}
                  className="text-xs font-semibold text-slate-500 hover:text-[#0A1428] ml-auto transition-colors"
                >
                  View full schedule →
                </button>
              </div>
            </div>

            {/* B. MIDDLE ROW: LEARNING PROGRESS & ASSIGNMENTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Progress & Weekly Velocity Card */}
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#182238] font-normal">
                      Learning progress
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Study hours & consistency</p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('subjects')}
                    className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-0.5"
                  >
                    View report <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                {/* Overall summary bar */}
                <div className="space-y-1.5 bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE6DF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Average across subjects:</span>
                    <span className="font-bold text-[#0A1428]">{subjects.length ? `${overallProgress}%` : '—'}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#182238] rounded-full transition-all duration-700"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500">Weekly study history is not tracked yet.</p>
              </div>
              {/* Assignments / Tasks Card */}
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-[#182238] font-normal">Assignments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Homework & review tasks</p>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('assignments')}
                    className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-0.5"
                  >
                    See all ({assignments.length}) <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {assignmentsLoading ? (
                    <p className="text-xs text-slate-500">Loading assignments…</p>
                  ) : assignments.length === 0 ? (
                    <p className="text-xs text-slate-500">No assignments assigned yet.</p>
                  ) : (
                    assignments.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#FAF7F2] transition-colors group cursor-pointer border border-transparent hover:border-[#EAE6DF]"
                        onClick={() => setSelectedAssignmentModal(item)}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAssignment(item);
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            {item.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <h4
                              className={`text-xs font-bold leading-snug transition-colors ${
                                item.status === 'COMPLETED'
                                  ? 'line-through text-slate-400'
                                  : 'text-[#0A1428] group-hover:text-[#E05A47]'
                              }`}
                            >
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.status === 'COMPLETED' ? (
                                <span className="text-emerald-600 font-semibold">Completed</span>
                              ) : (
                                `Due ${new Date(item.dueDate).toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}`
                              )}
                              {item.score !== null && item.score !== undefined && ` · ${item.score}/${item.maxScore || 10}`}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 mt-1 shrink-0" />
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setAddTaskModalOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:text-[#E05A47] hover:border-[#E05A47] transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Self-Study Task</span>
                </button>
              </div>
            </div>

            {/* C. CURRENT SUBJECTS CARDS (Figma Distinct Color Themed Cards) */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-[#182238] font-normal">
                    Current subjects
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Course progress across your subjects
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddSubjectModalOpen(true)}
                    className="btn btn-outline text-xs px-3 py-1.5 rounded-full font-bold text-slate-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subject</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('subjects')}
                    className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-0.5"
                  >
                    All subjects <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {subjectsLoading ? (
                  <p className="text-xs text-slate-500">Loading subjects…</p>
                ) : (
                  subjects.map((subject, idx) => {
                    const colorThemes = [
                      {
                        bg: 'bg-[#EBF3F9]',
                        border: 'border-[#D6E6F2]',
                        text: 'text-[#0284C7]',
                        accent: 'bg-[#0284C7]',
                      },
                      {
                        bg: 'bg-[#FDF2F4]',
                        border: 'border-[#FBD5DC]',
                        text: 'text-[#E11D48]',
                        accent: 'bg-[#E11D48]',
                      },
                      {
                        bg: 'bg-[#EDF7ED]',
                        border: 'border-[#C8E6C9]',
                        text: 'text-[#16A34A]',
                        accent: 'bg-[#16A34A]',
                      },
                    ];
                    const theme = colorThemes[idx % colorThemes.length];

                    return (
                      <div
                        key={subject.id}
                        className={`${theme.bg} ${theme.border} border rounded-2xl p-4 flex flex-col justify-between min-h-[140px] hover:shadow-sm transition-all`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-[#182238]">
                              {subject.subjectName}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{subject.topic}</p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-black/5">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Progress
                            </span>
                            <span className="font-extrabold text-[#182238]">
                              {subject.progressPct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${theme.accent} rounded-full`}
                              style={{ width: `${subject.progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: Recommended Tutors & Activity & Chat */}
          <div className="lg:col-span-4 space-y-6">
            {/* Selected tutors and their learning workspaces */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div>
                <h3 className="font-serif text-xl text-[#182238] font-normal">Your tutors</h3>
                <p className="text-xs text-slate-400 mt-0.5">Continue learning with tutors you selected.</p>
              </div>
              {!chatTutors.length && (
                <div className="rounded-2xl bg-[#FAF7F2] p-4 text-center">
                  <p className="text-xs text-slate-500">You haven’t selected a tutor yet.</p>
                  <button onClick={onFindTutor} className="mt-3 text-xs font-bold text-[#E05A47] hover:underline">
                    Browse tutors <ArrowRight className="inline h-3 w-3" />
                  </button>
                </div>
              )}
              {chatTutors.map((tutor) => (
                <div key={tutor.id} className="flex items-center gap-3 rounded-2xl border border-[#F0ECE5] p-3">
                  <Image
                    src={tutor.avatarUrl || '/tutor_female_1.jpg'}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-xl object-cover"
                    onError={(event) => { event.currentTarget.src = '/tutor_female_1.jpg'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#182238]">{tutor.name}</p>
                    <p className="text-[11px] text-slate-500">Your tutor</p>
                  </div>
                  <Link
                    href={`/student/workspace/${encodeURIComponent(tutor.id)}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#E05A47] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#c94938]"
                  >
                    Enter workspace <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

            {/* A. RECOMMENDED TUTORS CARD (Ethiopian Verified Tutors) */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-[#182238] font-normal">
                    Recommended tutors
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Top-rated Ethiopian mentors</p>
                </div>
                <button
                  onClick={onFindTutor}
                  className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-0.5"
                >
                  Browse <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div className="rounded-xl bg-[#FAF7F2] px-3 py-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <label htmlFor="student-max-tutor-rate">Max hourly rate</label>
                  <span className="text-[#E05A47]">{maxTutorRate.toLocaleString()} ETB</span>
                </div>
                <input
                  id="student-max-tutor-rate"
                  aria-label="Maximum tutor hourly rate in ETB"
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={maxTutorRate}
                  onChange={(event) => setMaxTutorRate(Number(event.target.value))}
                  className="mt-2 w-full accent-[#E05A47]"
                />
              </div>

              <div className="space-y-3">
                {affordableRecommendedTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    onClick={() => onSelectTutor(tutor)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF7F2] transition-all border border-transparent hover:border-[#EAE6DF] cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={tutor.avatar || '/tutor_female_1.jpg'}
                        alt={tutor.name}
                        width={48}
                        height={48}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src = '/tutor_female_1.jpg';
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#182238] group-hover:text-[#E05A47] transition-colors flex items-center gap-1">
                          <span>{tutor.name}</span>
                          {selectedTutorIds.includes(tutor.id) && <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">SELECTED</span>}
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {tutor.subjects?.[0] || tutor.title || 'Tutor'} ·{' '}
                          {tutor.rating != null && <span className="font-bold text-amber-500">★ {tutor.rating}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#E05A47] block">
                        {tutor.hourlyRateETB != null ? `${tutor.hourlyRateETB} ETB` : 'Rate not provided'}
                      </span>
                      <span className="text-[10px] text-slate-400">/hr</span>
                    </div>
                  </div>
                ))}
                {affordableRecommendedTutors.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">
                    No tutors are listed at or below {maxTutorRate.toLocaleString()} ETB per hour. Try raising your maximum rate.
                  </p>
                )}
              </div>

              <button
                onClick={onFindTutor}
                className="w-full btn btn-outline py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#E05A47]"
              >
                Browse All Verified Tutors
              </button>
            </div>

            {/* B. RECENT ACTIVITY CARD */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <h3 className="font-serif text-xl text-[#182238] font-normal">Recent activity</h3>

              <div className="space-y-3.5">
                {activityLoading && <p className="text-xs text-slate-500">Loading activity…</p>}
                {!activityLoading && activity.length === 0 && <p className="text-xs text-slate-500">No recent activity yet.</p>}
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === 'lesson' ? (
                        <Video className="w-3 h-3 text-[#E05A47]" />
                      ) : (
                        <FileText className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#182238] leading-snug">{item.title}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB VIEW 2: SCHEDULED LESSONS & TIMETABLE */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Scheduled Lessons & Classrooms
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your live 1-on-1 tutoring sessions across Addis Ababa time (EAT).
              </p>
            </div>
            <button
              onClick={onFindTutor}
              className="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-full"
            >
              + Book Another Session
            </button>
          </div>

          <div className="space-y-4">
            {paymentError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{paymentError}</p>}
            {lessonLoading && <p className="text-sm text-slate-500">Loading lessons…</p>}
            {!lessonLoading && allLessons.length === 0 && <p className="text-sm text-slate-500">No upcoming lessons scheduled.</p>}
            {allLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE6DF] overflow-hidden shrink-0">
                    <Image
                      src={lesson.tutor?.avatarUrl || '/tutor_female_1.jpg'}
                      alt={lesson.tutor?.name || 'Tutor'}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0A1428]">{lesson.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lesson.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Tutor: <strong className="text-[#0A1428]">{lesson.tutor?.name}</strong> ·{' '}
                      {lesson.topic}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#E05A47]" />
                      <span>
                        {formatLessonTime(lesson.scheduledAt, user?.timeZone, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        ({lesson.durationMins} mins)
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lesson.payment?.status === 'PAID' ? (
                    <span className="text-[10px] font-bold text-emerald-700">Paid</span>
                  ) : lesson.payment?.status === 'PENDING' && lesson.payment.currency === 'ETB' && lesson.payment.checkoutUrl ? (
                    <a href={lesson.payment.checkoutUrl} className="btn btn-outline text-xs px-3 py-2 font-bold">Resume ETB checkout</a>
                  ) : lesson.payment?.status === 'PENDING' ? (
                    <span className="text-[10px] text-amber-700">Payment pending</span>
                  ) : lesson.status === 'CONFIRMED' && lesson.tutor?.tutorProfile?.hourlyRateETB > 0 ? (
                    <button disabled={payingLessonId === lesson.id} onClick={() => startLessonPayment(lesson)} className="btn btn-outline text-xs px-3 py-2 font-bold disabled:opacity-50">
                      {payingLessonId === lesson.id ? 'Starting…' : `Pay ${((lesson.tutor.tutorProfile.hourlyRateETB * lesson.durationMins) / 60).toLocaleString()} ETB`}
                    </button>
                  ) : null}
                  <button
                    onClick={() =>
                      lesson.meetingUrl
                        ? onJoinLesson(lesson)
                      : undefined
                    }
                    disabled={!lesson.meetingUrl}
                    className="btn btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSubTab('messages');
                    }}
                    className="btn btn-outline text-xs px-3 py-2 font-bold text-slate-700"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>

          <section className="border-t border-[#EAE6DF] pt-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#0A1428]">Review completed lessons</h3>
              <p className="text-xs text-slate-500 mt-1">Share feedback after a lesson is marked complete.</p>
            </div>
            {reviewMessage && <p role="status" className="text-xs text-slate-600">{reviewMessage}</p>}
            {reviewableLessons.length === 0 && <p className="text-sm text-slate-500">No completed lessons are waiting for a review.</p>}
            {reviewableLessons.map((lesson) => {
              const draft = reviewDrafts[lesson.id] || { rating: 5, comment: '' };
              return (
                <div key={lesson.id} className="rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-[#0A1428]">{lesson.title}</p>
                    <p className="text-xs text-slate-500">With {lesson.tutor.name} · {new Date(lesson.scheduledAt).toLocaleDateString()}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">Rating
                    <select value={draft.rating} onChange={(event) => setReviewDrafts((current) => ({ ...current, [lesson.id]: { ...draft, rating: Number(event.target.value) } }))} className="rounded-lg border border-slate-300 px-2 py-1">
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                    </select>
                  </label>
                  <textarea value={draft.comment} onChange={(event) => setReviewDrafts((current) => ({ ...current, [lesson.id]: { ...draft, comment: event.target.value } }))} maxLength={2000} placeholder="Write an optional comment" className="w-full rounded-lg border border-slate-300 p-2 text-xs" />
                  <button onClick={() => submitLessonReview(lesson.id)} className="btn btn-primary rounded-lg px-4 py-2 text-xs font-bold">Submit review</button>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {/* 6. TAB VIEW 3: ASSIGNMENTS & HOMEWORK */}
      {activeSubTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Assignments & Practice Tests
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track homework, exam practice sheets, and tutor grading feedback.
              </p>
            </div>
            <button
              onClick={() => setAddTaskModalOpen(true)}
              className="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Assignment / Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignmentsLoading && <p className="text-sm text-slate-500">Loading assignments…</p>}
            {!assignmentsLoading && assignments.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
            {assignments.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAssignmentModal(item)}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] hover:border-[#E05A47]/60 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#EAE6DF] text-slate-600">
                      {item.subject || 'Academic Task'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#0A1428] leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.instructions || 'No instructions provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF] text-xs">
                  <div className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E05A47]" />
                    <span>
                      Due:{' '}
                      {new Date(item.dueDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAssignment(item);
                    }}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                      item.status === 'COMPLETED'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-[#E05A47] text-white hover:bg-[#C94635]'
                    }`}
                  >
                    {item.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Completed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB VIEW 4: SUBJECTS & CURRICULUM PROGRESS */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Subjects & Matric Syllabus
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ethiopian Ministry of Education syllabus tracking & unit completion.
              </p>
            </div>
            <button
              onClick={() => setAddSubjectModalOpen(true)}
              className="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjectsLoading && <p className="text-sm text-slate-500">Loading subjects…</p>}
            {!subjectsLoading && subjects.length === 0 && <p className="text-sm text-slate-500">No subjects added yet.</p>}
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#EAE6DF] space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0A1428]">{sub.subjectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{sub.topic}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EAE6DF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Syllabus Progress</span>
                    <span className="font-bold text-[#0A1428]">{sub.progressPct}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E05A47] rounded-full"
                      style={{ width: `${sub.progressPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    Assigned Tutor: <strong className="text-slate-700">{sub.tutorName || 'Not assigned'}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'messages' && (
        <div className="space-y-5">
          <div><h2 className="font-serif text-2xl text-[#0A1428]">Tutor Workspaces</h2><p className="mt-1 text-xs text-slate-500">Chat with your tutors and follow the learning plan they create for you.</p></div>
          {!chatTutors.length && <div className="rounded-3xl border border-[#EAE6DF] bg-white p-8 text-center text-sm text-slate-500">Select a tutor to start a conversation.</div>}
          {chatTutors.map((tutor) => <div key={tutor.id} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]"><TutorStudentChat tutorId={tutor.id} studentId={user.id} user={user} /><TutorStudentCurriculum tutorId={tutor.id} studentId={user.id} /></div>)}
        </div>
      )}
      {/* 9. ASSIGNMENT DETAILS MODAL */}
      {selectedAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="badge badge-coral text-[10px]">
                {selectedAssignmentModal.status}
              </span>
              <button
                onClick={() => setSelectedAssignmentModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-[#0A1428] font-normal leading-tight">
                {selectedAssignmentModal.title}
              </h3>
              <p className="text-xs text-slate-500">
                Due Date:{' '}
                {new Date(selectedAssignmentModal.dueDate).toLocaleString([], {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE6DF] space-y-2">
              <h4 className="text-xs font-bold text-[#0A1428] uppercase tracking-wider">
                Tutor Instructions
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedAssignmentModal.instructions ||
                  'Solve problems clearly showing your mathematical working. Review your answers with your tutor during next session.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleAssignment(selectedAssignmentModal);
                  setSelectedAssignmentModal(null);
                }}
                className="btn btn-primary text-xs font-bold px-6 py-2.5 rounded-xl"
              >
                {selectedAssignmentModal.status === 'COMPLETED'
                  ? 'Mark as Incomplete'
                  : 'Submit Work / Mark Completed'}
              </button>

              <button
                onClick={() => setSelectedAssignmentModal(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. ADD SUBJECT MODAL */}
      {addSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl text-[#0A1428]">Enroll / Track New Subject</h3>
              <button
                onClick={() => setAddSubjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Subject Selection
                </label>
                <select
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs font-medium text-[#0A1428]"
                >
                  <option value="">Choose a subject</option>
                  {SUBJECT_GROUPS.map(({ name, subjects }) => (
                    <optgroup key={name} label={name}>
                      {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Current Chapter / Topic
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectTopic}
                  onChange={(e) => setNewSubjectTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry & Bonding"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSubjectModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-5 py-2 font-bold">
                  Add to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. ADD TASK / ASSIGNMENT MODAL */}
      {addTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl text-[#0A1428]">Add Self-Study Task</h3>
              <button
                onClick={() => setAddTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Task / Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 2022 Calculus Exam Section B"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddTaskModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-5 py-2 font-bold">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
