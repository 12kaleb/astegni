'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SUBJECT_GROUPS, SUBJECT_OPTIONS } from '../../lib/subject-catalog';
import TutorTrustSettings from './TutorTrustSettings';
import TutorAvailabilitySettings from './TutorAvailabilitySettings';
import ReportBlockActions from './ReportBlockActions';
import { useApiResource } from '../../lib/use-api-resource';
import { TutorDashboardMetrics, TutorDashboardTabs } from './TutorDashboardControls';
import TutorDashboardModals from './TutorDashboardModals';

const selectTutorProfile = (result) => result.profile || null;
const EMPTY_LIST = Object.freeze([]);
const selectTutorLessons = (result) => ({
  lessons: Array.isArray(result.lessons) ? result.lessons : [],
  pastLessons: Array.isArray(result.pastLessons) ? result.pastLessons : [],
  lessonCount: result.lessonCount ?? result.lessons?.length ?? 0,
  completedLessonCount: result.completedLessonCount ?? 0,
  activeStudentCount: result.activeStudentCount ?? result.students?.length ?? 0,
  students: Array.isArray(result.students) ? result.students : [],
  hoursTaughtMonth: result.hoursTaughtMonth ?? 0,
  estimatedLessonValueETB: result.estimatedLessonValueETB ?? null,
});
const selectTutorAssignments = (result) => Array.isArray(result.assignments) ? result.assignments : [];

function formatLessonTime(value, timeZone, options) {
  const zone = timeZone || 'Africa/Addis_Ababa';
  return `${new Date(value).toLocaleString([], { ...options, timeZone: zone })} (${zone})`;
}

function isTodayInZone(value, timeZone) {
  const zone = timeZone || 'Africa/Addis_Ababa';
  const key = (date) => date.toLocaleDateString('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  return key(new Date(value)) === key(new Date());
}
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Plus,
  Calendar,
  Star,
  Video,
  Edit3,
  Check,
  X,
  Send,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function TutorDashboard({ user }) {
  // Navigation tabs within tutor dashboard
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'schedule' | 'students' | 'assignments' | 'messages'

  // Data states
  const profileResource = useApiResource('/api/tutors/profile', selectTutorProfile);
  const lessonsResource = useApiResource('/api/tutors/lessons', selectTutorLessons);
  const assignmentsResource = useApiResource('/api/tutors/assignments', selectTutorAssignments);
  const profile = profileResource.data;
  const setProfile = profileResource.setData;
  const profileLoading = profileResource.loading;
  const profileError = profileResource.error;
  const setProfileError = profileResource.setError;
  const lessons = lessonsResource.data?.lessons || EMPTY_LIST;
  const pastLessons = lessonsResource.data?.pastLessons || EMPTY_LIST;
  const lessonCount = lessonsResource.data?.lessonCount || 0;
  const completedLessonCount = lessonsResource.data?.completedLessonCount || 0;
  const activeStudentCount = lessonsResource.data?.activeStudentCount || 0;
  const students = lessonsResource.data?.students || EMPTY_LIST;
  const hoursTaughtMonth = lessonsResource.data?.hoursTaughtMonth || 0;
  const estimatedLessonValueETB = lessonsResource.data?.estimatedLessonValueETB ?? null;
  const lessonsLoading = lessonsResource.loading;
  const lessonsError = lessonsResource.error;
  const setStudents = (update) => lessonsResource.setData((current) => ({
    ...(current || {}),
    students: typeof update === 'function' ? update(current?.students || []) : update,
  }));
  const assignments = assignmentsResource.data || EMPTY_LIST;
  const setAssignments = assignmentsResource.setData;
  const assignmentsLoading = assignmentsResource.loading;
  const assignmentsError = assignmentsResource.error;
  const setAssignmentsError = assignmentsResource.setError;

  // Prep tasks state
  const [prepTasks, setPrepTasks] = useState([]);
  const [newPrepText, setNewPrepText] = useState('');
  const [addingPrep, setAddingPrep] = useState(false);

  // Modals
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    title: '',
    university: '',
    experienceYears: '',
    location: '',
    bio: '',
    subjects: [],
    hourlyRateETB: '',
    openForStudents: false,
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');
  const selectedSubjects = profileForm.subjects;
  const subjectGroups = SUBJECT_GROUPS.map(({ name, subjects }) => ({
    name,
    subjects: name === 'Other'
      ? [...new Set([...subjects, ...selectedSubjects.filter((subject) => !SUBJECT_OPTIONS.includes(subject))])]
      : subjects,
  }));

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    studentId: '',
    title: '',
    dueDate: '',
    maxScore: 10,
  });
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');

  const [gradeModalAssignment, setGradeModalAssignment] = useState(null);
  const [gradeScoreInput, setGradeScoreInput] = useState('');

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      title: profile.title || '', university: profile.university || '',
      experienceYears: profile.experienceYears ?? '', location: profile.location || '',
      bio: profile.bio || '', subjects: profile.subjects || [],
      hourlyRateETB: profile.hourlyRateETB ?? '',
      openForStudents: profile.openForStudents !== false,
    });
  }, [profile]);

  useEffect(() => {
    if (!lessonsResource.data) return;
    setPrepTasks(lessons.map((lesson) => ({
      id: `prep-${lesson.id}`,
      text: `Prepare worksheet & notes for ${lesson.student?.name || 'Student'}'s ${lesson.title}`,
      status: isTodayInZone(lesson.scheduledAt, user?.timeZone) ? 'TODAY' : 'UPCOMING',
      done: false,
    })));
  }, [lessons, lessonsResource.data, user?.timeZone]);

  // Save profile updates to API
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveSuccess('');

    const payload = {
      title: profileForm.title,
      university: profileForm.university,
      experienceYears: String (profileForm.experienceYears ?? '').trim() === '' ? null : Number(profileForm.experienceYears),
      location: profileForm.location,
      bio: profileForm.bio,
      subjects: profileForm.subjects,
      hourlyRateETB: String(profileForm.hourlyRateETB ?? '').trim() === '' ? null : Number(profileForm.hourlyRateETB),
      openForStudents: profileForm.openForStudents,
    };

    try {
      const response = await fetch('/api/tutors/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile.');
      }

      setProfile((prev) => ({ ...prev, ...result.profile }));
      setProfileSaveSuccess(result.profile.isVerified
        ? 'Profile, subjects, and hourly rate saved.'
        : 'Profile saved. Student search will show it after an admin verifies it.');
      setTimeout(() => setEditProfileModalOpen(false), 800);
    } catch (error) {
      setProfileSaveSuccess(error.message || 'Could not update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Toggle accepting new students
  const handleToggleAcceptingStudents = async () => {
    const updatedStatus = !profile?.openForStudents;

    try {
      const response = await fetch('/api/tutors/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openForStudents: updatedStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update availability.');
      setProfile((prev) => ({ ...prev, openForStudents: result.profile.openForStudents }));
      setProfileForm((prev) => ({ ...prev, openForStudents: result.profile.openForStudents }));
    } catch (error) {
      setProfileError(error.message || 'Could not update availability.');
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.studentId || !assignmentForm.title.trim()) return;

    setAssignmentSaving(true);
    setAssignmentMessage('');

    try {
      const response = await fetch('/api/tutors/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: assignmentForm.studentId,
          title: assignmentForm.title,
          dueDate: assignmentForm.dueDate,
          maxScore: Number(assignmentForm.maxScore) || 10,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not assign work.');
      setAssignments((prev) => [result.assignment, ...prev]);
      setAssignmentMessage('Assignment assigned successfully!');
      setTimeout(() => {
        setAssignmentModalOpen(false);
        setAssignmentMessage('');
      }, 700);
    } catch (error) {
      setAssignmentMessage(error.message || 'Could not assign work.');
    } finally {
      setAssignmentSaving(false);
    }
  };

  // Grade Assignment
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradeModalAssignment) return;

    const score = parseFloat(gradeScoreInput);
    if (isNaN(score)) return;

    try {
      const response = await fetch('/api/tutors/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: gradeModalAssignment.id,
          score,
          status: 'COMPLETED',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save the grade.');
      setAssignments((prev) => prev.map((a) => a.id === gradeModalAssignment.id ? result.assignment : a));
      setGradeModalAssignment(null);
      setGradeScoreInput('');
    } catch (error) {
      setAssignmentsError(error.message || 'Could not save the grade.');
    }
  };

  // Toggle prep task
  const toggleTask = (id) => {
    setPrepTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Add custom prep task
  const handleAddPrepTask = (e) => {
    e.preventDefault();
    if (!newPrepText.trim()) return;

    setPrepTasks((prev) => [
      ...prev,
      {
        id: `prep-${Date.now()}`,
        text: newPrepText.trim(),
        status: 'TODAY',
        done: false,
      },
    ]);
    setNewPrepText('');
    setAddingPrep(false);
  };

  // Compute lessons today
  const todayLessons = lessons.filter(
    (l) => isTodayInZone(l.scheduledAt, user?.timeZone)
  );
  const uncompletedPrepTasks = prepTasks.filter((t) => !t.done);

  const displayRate = profile?.hourlyRateETB != null ? `${profile.hourlyRateETB.toLocaleString()} ETB` : 'Not set';
  const displayLessonValue = estimatedLessonValueETB == null
    ? 'Rate not set'
    : `${estimatedLessonValueETB.toLocaleString()} ETB`;

  const tutorName = profile?.user?.name || user?.name || 'Tutor';
  const searchVisibilityMessage = profile && !profile.isVerified
    ? 'Your profile is saved, but it will appear in student search after an admin verifies it.'
    : profile && !profile.openForStudents
      ? 'Your profile is verified but paused. Turn on “Open for New Students” to appear in search.'
      : '';

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1240px] mx-auto pb-12">
      {/* 1. TOP HEADER & GREETING BAR */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-coral text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {profile?.isVerified ? 'Verified Astegni Educator' : 'Educator Account'}
              </span>
            </span>

            {profile?.reviewsCount > 0 && profile?.rating != null && <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{profile?.rating?.toFixed(1) || 'Not rated'}</span>
              <span className="text-slate-400 font-normal">
                ({profile?.reviewsCount ?? 0} reviews)
              </span>
            </span>}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#182238] font-normal tracking-tight">
            Welcome back, {tutorName.split(/\s+/)[0]}.
          </h1>

          <p className="text-sm text-slate-500">
            {todayLessons.length > 0
              ? `You have ${todayLessons.length} ${
                  todayLessons.length === 1 ? 'lesson' : 'lessons'
                } today and ${uncompletedPrepTasks.length} pending prep tasks.`
              : `No lessons today. You have ${lessons.length} upcoming sessions scheduled this week.`}
          </p>
          {searchVisibilityMessage && (
            <p className="mt-2 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              {searchVisibilityMessage}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEditProfileModalOpen(true)}
            className="btn btn-outline text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 text-slate-700 hover:text-[#E05A47]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile & Rates</span>
          </button>

          <p className="max-w-xs text-right text-xs text-slate-500">Students request bookings from your profile. Review requests in your timetable.</p>
        </div>
      </div>

      <TutorTrustSettings onAvatarUpdated={(avatarUrl) => setProfile((current) => current ? { ...current, user: { ...current.user, avatarUrl } } : current)} />
      <TutorAvailabilitySettings />

      {(profileError || lessonsError || assignmentsError) && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {[profileError, lessonsError, assignmentsError].filter(Boolean).join(' ')}
        </div>
      )}

      <TutorDashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} lessons={lessons} students={students} assignments={assignments} />

      <TutorDashboardMetrics lessons={lessons} lessonsLoading={lessonsLoading} lessonCount={lessonCount} students={students} activeStudentCount={activeStudentCount} displayLessonValue={displayLessonValue} hoursTaughtMonth={hoursTaughtMonth} profile={profile} />

      {/* 4. TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Upcoming Schedule & Lesson Prep */}
          <div className="lg:col-span-8 space-y-6">
            {/* Upcoming Schedule Card */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl text-[#182238] font-normal">
                    Upcoming Teaching Schedule
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live video classrooms & scheduled home visits
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-xs font-semibold text-[#E05A47] hover:underline flex items-center gap-0.5"
                >
                  Full calendar ({lessons.length}) <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {lessonsLoading ? (
                  <p className="py-4 text-xs text-slate-500">Loading schedule…</p>
                ) : lessons.length === 0 ? (
                  <p className="py-4 text-xs text-slate-500">
                    No upcoming lessons or booking requests.
                  </p>
                ) : (
                  lessons.slice(0, 4).map((lesson) => {
                    const startsAt = new Date(lesson.scheduledAt);
                    const isToday = isTodayInZone(lesson.scheduledAt, user?.timeZone);

                    return (
                      <div
                        key={lesson.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-[#0A1428] font-bold text-xs flex items-center justify-center shrink-0">
                            {lesson.student?.name
                              ?.split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join('')
                              .toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#182238]">
                                {lesson.student?.name || 'Student'}
                              </h4>
                              {isToday && (
                                <span className="bg-[#E05A47]/10 text-[#E05A47] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  TODAY
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  lesson.status === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                               }`}
                              >
                                {lesson.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {lesson.title} · {lesson.topic || 'Curriculum review'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[#E05A47]" />
                              <span>
                                {formatLessonTime(lesson.scheduledAt, user?.timeZone, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })} · ({lesson.durationMins || 60} mins)
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {lesson.meetingUrl ? (
                            <a
                              href={`/lessons/${lesson.id}`}
                              className="btn btn-primary text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Enter Session Room</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              className="btn btn-primary text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-xs opacity-50 cursor-not-allowed"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Meeting link unavailable</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Lesson Preparation Checklist Card */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl text-[#182238] font-normal">
                    Lesson Preparation & Teaching Notes
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Checklist for upcoming curriculum sessions
                  </p>
                </div>
                <button
                  onClick={() => setAddingPrep(true)}
                  className="btn btn-outline text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 text-slate-700 hover:text-[#E05A47]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>

              {addingPrep && (
                <form
                  onSubmit={handleAddPrepTask}
                  className="flex gap-2 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE6DF]"
                >
                  <input
                    type="text"
                    required
                    placeholder="e.g. Print past Matric exam papers on vectors"
                    value={newPrepText}
                    onChange={(e) => setNewPrepText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-[#E05A47]"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary text-xs px-4 py-1.5 rounded-xl font-bold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingPrep(false)}
                    className="btn btn-outline text-xs px-3 py-1.5 rounded-xl"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="space-y-2.5">
                {prepTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F2] cursor-pointer transition-colors border border-transparent hover:border-[#EAE6DF]"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600">
                        {task.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <span
                        className={`text-xs ${
                          task.done
                            ? 'line-through text-slate-400'
                            : 'text-[#182238] font-semibold'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'TODAY'
                          ? 'bg-[#E05A47]/10 text-[#E05A47]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Availability, Students Quick Access & Inquiries */}
          <div className="lg:col-span-4 space-y-6">
            {/* Availability & Teaching Schedule */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#182238] font-normal">
                  Teaching Availability
                </h3>
                <button
                  onClick={() => setEditProfileModalOpen(true)}
                  className="text-xs font-semibold text-[#E05A47] hover:underline"
                >
                  Edit Hours
                </button>
              </div>

              {/* Status Toggle */}
              <div
                onClick={handleToggleAcceptingStudents}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] cursor-pointer hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1428]">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      profile?.openForStudents ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    {profile?.openForStudents
                      ? 'Open for New Students'
                      : 'Not Accepting Students'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    profile?.openForStudents
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {profile?.openForStudents ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Quick Student Roster Card */}
            <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#182238] font-normal">Active Students</h3>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-semibold text-[#E05A47] hover:underline"
                >
                  View All ({students.length})
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {students.slice(0, 3).map((student) => (
                  <div
                    key={student.id}
                    className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#182238]">{student.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {student.grade || 'Grade not provided'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('messages')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#E05A47] hover:bg-[#FAF7F2] transition-colors"
                      title="Send message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setAssignmentForm((prev) => ({
                    ...prev,
                    studentId: students[0]?.id || '',
                  }));
                  setAssignmentModalOpen(true);
                }}
                className="w-full btn btn-outline py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#E05A47] flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Homework to Student</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: SCHEDULE & TIMETABLE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Teaching Timetable & Sessions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                All confirmed and pending lessons with students across Ethiopia.
              </p>
            </div>
            <span className="text-xs text-slate-500">Students request lessons from your tutor profile.</span>
          </div>

          <div className="space-y-4">
            {lessonsLoading && <p className="text-sm text-slate-500">Loading lessons…</p>}
            {!lessonsLoading && lessons.length === 0 && <p className="text-sm text-slate-500">No upcoming lessons scheduled.</p>}
            {lessons.map((lesson) => {
              const startsAt = new Date(lesson.scheduledAt);
              return (
                <div
                  key={lesson.id}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE6DF] flex items-center justify-center font-bold text-sm text-[#0A1428] shrink-0">
                      {lesson.student?.name?.charAt(0) || 'S'}
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
                        Student: <strong className="text-[#0A1428]">{lesson.student?.name}</strong>{' '}
                        · {lesson.topic}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E05A47]" />
                        <span>
                          {formatLessonTime(lesson.scheduledAt, user?.timeZone, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })} · ({lesson.durationMins || 60} mins)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        window.open(
                        lesson.meetingUrl,
                          '_blank'
                        )
                      }
                      disabled={!lesson.meetingUrl}
                      className="btn btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{lesson.meetingUrl ? 'Start Classroom' : 'Meeting link unavailable'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('messages');
                      }}
                      className="btn btn-outline text-xs px-3 py-2 font-bold text-slate-700"
                    >
                      Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 3: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Enrolled Students Roster
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Students attending your 1-on-1 tutoring sessions in Addis Ababa.
              </p>
            </div>
            <button
              onClick={() => {
                setAssignmentForm((prev) => ({
                  ...prev,
                  studentId: students[0]?.id || '',
                }));
                setAssignmentModalOpen(true);
              }}
              className="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Homework</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#EAE6DF] flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#E05A47]/10 text-[#E05A47] font-bold text-lg flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#0A1428]">{student.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {student.grade || 'Grade not provided'}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="truncate max-w-[150px]">{student.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span>{student.phone || 'Phone not provided'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Link href={`/tutor/students/${encodeURIComponent(student.id)}`} className="w-full btn btn-primary text-center text-xs py-2 font-bold">
                    Open student workspace
                  </Link>
                </div>
                <ReportBlockActions targetUserId={student.id} onBlocked={(studentId) => setStudents((current) => current.filter((item) => item.id !== studentId))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: ASSIGNMENTS GIVEN */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
            <div>
              <h2 className="font-serif text-2xl text-[#0A1428] font-normal">
                Assignments & Homework Given
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Review submitted worksheets, grade problem sets, and assign practice.
              </p>
            </div>
            <button
              onClick={() => {
                setAssignmentForm((prev) => ({
                  ...prev,
                  studentId: students[0]?.id || '',
                }));
                setAssignmentModalOpen(true);
              }}
              className="btn btn-primary text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignmentsLoading && <p className="text-sm text-slate-500">Loading assignments…</p>}
            {!assignmentsLoading && assignments.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
            {assignments.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#EAE6DF] text-slate-600">
                      Student: {item.student?.name || 'Student'}
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
                  <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                    <span>
                      Due:{' '}
                      {new Date(item.dueDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-bold text-[#0A1428]">
                      Score: {item.score !== null ? `${item.score}/${item.maxScore || 10}` : 'Ungraded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE6DF]">
                  <button
                    onClick={() => {
                      setGradeModalAssignment(item);
                      setGradeScoreInput(item.score !== null ? String(item.score) : '10');
                    }}
                    className="btn btn-primary text-xs px-4 py-1.5 font-bold rounded-xl"
                  >
                    {item.score !== null ? 'Update Grade' : 'Grade Assignment'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="rounded-3xl border border-[#EAE6DF] bg-white p-8 text-center text-sm text-slate-500">
          Messaging is not available yet.
        </div>
      )}
      <TutorDashboardModals {...{ editProfileModalOpen, setEditProfileModalOpen, profileSaveSuccess, isSavingProfile, handleSaveProfile, profileForm, setProfileForm, selectedSubjects, subjectGroups, assignmentModalOpen, setAssignmentModalOpen, assignmentForm, setAssignmentForm, assignmentSaving, assignmentMessage, handleCreateAssignment, students, gradeModalAssignment, setGradeModalAssignment, gradeScoreInput, setGradeScoreInput, handleSaveGrade }} />

    </div>
  );
}
