'use client';

import React, { useState ,useEffect} from 'react';
import { ArrowRight, CheckCircle2, Circle, Clock, MessageSquare, Plus, ChevronRight } from 'lucide-react';

export default function TutorDashboard({ currency = 'ETB' ,user }) {

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({
    title: '',
    location: '',
    bio: '',
    subjects: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [lessons, setLessons] = useState([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [activeStudentCount, setActiveStudentCount] = useState(0);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState('');
  const [prepTasks, setPrepTasks] = useState([]);


useEffect(() => {
  let isActive = true;

  async function loadProfile() {
    try {
      const response = await fetch('/api/tutors/profile', {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not load your profile.');
      }

      if(isActive){
      setProfile(result.profile);
      setProfileForm({
      title: result.profile.title ?? '',
      location: result.profile.location ?? '',
      bio: result.profile.bio ?? '',
      subjects: result.profile.subjects.join(', '),
      
});

   }
    } catch (error) {
      if (isActive) setProfileError(error.message);
    } finally {
      if (isActive) setProfileLoading(false);
    }
  }

  loadProfile();

  return () => {
    isActive = false;
  };
}, []);

useEffect(() => {
  let isActive = true;

  async function loadLessons() {
    try {
      const response = await fetch('/api/tutors/lessons', {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not load lessons.');
      }

      if (isActive){ setLessons(result.lessons);
        setPrepTasks(
          result.lessons.map((lesson) => ({
            id: lesson.id,
            text: `Prepare for ${lesson.student.name}'s ${lesson.title} lesson`,
            status:
              new Date(lesson.scheduledAt).toDateString() ===
              new Date().toDateString()
                ? 'TODAY'
                : 'LATER',
            done: false,
          }))
        );
        setActiveStudentCount(result.activeStudentCount);
      setLessonCount(result.lessonCount);
      }
    } catch (error) {
      if (isActive) setLessonsError(error.message);
    } finally {
      if (isActive) setLessonsLoading(false);
    }
  }

  loadLessons();

  return () => {
    isActive = false;
  };
}, []);

const students = Array.from(
  new Map(
    lessons.map((lesson) => [
      lesson.studentId,
      {
        id: lesson.studentId,
        name: lesson.student.name,
        initials: lesson.student.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase(),
        frequency: `${lesson.title} · Upcoming`,
      },
    ])
  ).values()
);

const saveProfile = async (event) => {
  event.preventDefault();
  setIsSavingProfile(true);
  setProfileSaveMessage('');

  try {
    const response = await fetch('/api/tutors/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: profileForm.title,
        location: profileForm.location,
        bio: profileForm.bio,
        subjects: profileForm.subjects
          .split(',')
          .map((subject) => subject.trim())
          .filter(Boolean),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Could not save your profile.');
    }

    setProfile((current) => ({ ...current, ...result.profile }));
    setProfileSaveMessage(
      result.profile.isVerified
        ? 'Profile saved.'
        : 'Profile saved. A team member must verify it before it appears in search.'
    );
  } catch (error) {
    setProfileSaveMessage(error.message || 'Could not save your profile.');
  } finally {
    setIsSavingProfile(false);
  }
};

  const [activeDays, setActiveDays] = useState(['M', 'T', 'W', 'Th', 'F']);

  const toggleTask = (id) => {
    setPrepTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };


  const days = ['M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1240px] mx-auto">
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#182238] font-normal tracking-tight">
          Welcome back, {user?.name?.split(/\s+/)[0] || 'Tutor'}.
          </h1>


          <div className="mt-3 rounded-xl border border-[#EAE6DF] bg-white p-4">
  {profileLoading ? (
    <p>Loading your tutor profile…</p>
  ) : profileError ? (
    <p className="text-red-600">{profileError}</p>
  ) : (
    <>
      <p className="font-semibold">
        {profile.title || 'Tutor title not set'}
      </p>
      <p className="text-slate-500">
        {profile.location || 'Location not set'}
      </p>
      <p className="mt-1 text-xs">
        {profile.isVerified ? 'Verified tutor' : 'Pending verification'}
      </p>

      <form onSubmit={saveProfile} className="mt-4 space-y-3">
        <h2 className="font-semibold">Edit tutor profile</h2>

        <input
          value={profileForm.title}
          onChange={(event) =>
            setProfileForm({ ...profileForm, title: event.target.value })
          }
          maxLength={120}
          placeholder="Tutor title"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />

        <input
          value={profileForm.location}
          onChange={(event) =>
            setProfileForm({ ...profileForm, location: event.target.value })
          }
          maxLength={120}
          placeholder="Location"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />

        <textarea
          value={profileForm.bio}
          onChange={(event) =>
            setProfileForm({ ...profileForm, bio: event.target.value })
          }
          maxLength={3000}
          placeholder="Short introduction"
          rows={4}
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />

        <input
          value={profileForm.subjects}
          onChange={(event) =>
            setProfileForm({ ...profileForm, subjects: event.target.value })
          }
          placeholder="Subjects, separated by commas"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        />

        <button
          type="submit"
          disabled={isSavingProfile}
          className="btn btn-primary rounded-lg px-4 py-2 text-sm font-bold"
        >
          {isSavingProfile ? 'Saving…' : 'Save profile'}
        </button>

        {profileSaveMessage && (
          <p role="status" className="text-sm text-slate-600">
            {profileSaveMessage}
          </p>
        )}
        </form>
          </>
         )}
          </div>


          <p className="text-sm text-slate-500 mt-1">
            You have three lessons and two prep tasks today.
          </p>
        </div>

        <div>
          <button className="bg-[#E85D4E] hover:bg-[#D54A3B] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95">
            Add availability
          </button>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium block">Upcoming lessons</span>
          <div className="text-3xl font-serif text-[#182238] my-1">{lessonsLoading || lessonsError ? '—' : lessonCount}</div>
          <span className="text-[11px] text-slate-400">{lessonsLoading
  ? 'Loading schedule…'
  : lessonsError
    ? 'Schedule unavailable'
    : lessons.length > 0
      ? `Next: ${new Date(lessons[0].scheduledAt).toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`
      : 'No upcoming lessons'}</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium block">Students with upcoming lessons</span>
          <div className="text-3xl font-serif text-[#182238] my-1">{lessonsLoading || lessonsError ? '—' : activeStudentCount}</div>
          <span className="text-[11px] text-slate-400">Based on confirmed and pending lessons</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium block">This month</span>
          <div className="text-3xl font-serif text-[#182238] my-1">
          {profileLoading || profileError || !profile
  ? '—'
  : currency === 'ETB'
    ? `ETB ${profile.hourlyRateETB.toLocaleString()}`
    : `$${profile.hourlyRateUSD}`}
          </div>
          <span className="text-[11px] text-[#2E7D32] font-medium flex items-center gap-0.5">
          Per 60-minute lesson
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <span className="text-xs text-slate-500 font-medium block">Tutor rating</span>
          <div className="text-3xl font-serif text-[#182238] my-1">{profileLoading || profileError || !profile
  ? '—'
  : profile.rating.toFixed(1)}</div>
          <span className="text-[11px] text-slate-400">{profileLoading || profileError || !profile
  ? 'Reviews unavailable'
  : `${profile.reviewsCount} family reviews`}</span>
        </div>

      </div>

      {/* Main Grid: Left & Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#182238] font-normal">
              Upcoming schedule
              </h2>
              <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                Full calendar <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            

            <div className="divide-y divide-slate-100">
            {lessonsLoading ? (
  <p className="py-4 text-sm text-slate-500">Loading lessons…</p>
) : lessonsError ? (
  <p role="alert" className="py-4 text-sm text-red-600">
    {lessonsError}
  </p>
) : lessons.length === 0 ? (
  <p className="py-4 text-sm text-slate-500">
    No upcoming lessons scheduled.
  </p>
) : (
  lessons.map((lesson) => {
    const startsAt = new Date(lesson.scheduledAt);
    const initials = lesson.student.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
      

    return (
      <div key={lesson.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
        <span className="text-xs font-bold text-[#E85D4E]">
          {startsAt.toLocaleDateString()} ·{' '}
          {startsAt.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs tracking-wider">
              {initials}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#182238]">
                {lesson.student.name}
              </h4>
              <p className="text-xs text-slate-500">
                {lesson.title} · {lesson.durationMins} min
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {lesson.status === 'PENDING' ? 'Pending' : 'Confirmed'}
          </span>
        </div>
      </div>
    );
  })
)}
            </div>
          </div>

          {/* Student Roster Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-[#182238] font-normal">
                Student roster
              </h2>
              <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {students.map((student, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs tracking-wider">
                      {student.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#182238]">{student.name}</h4>
                      <p className="text-xs text-slate-500">{student.frequency}</p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 p-1">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Preparation Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <h2 className="font-serif text-xl text-[#182238] font-normal">
              Lesson preparation
            </h2>

            <div className="space-y-3.5">
              {prepTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600">
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <span
                      className={`text-sm ${
                        task.done ? 'line-through text-slate-400' : 'text-[#182238] font-medium'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'TODAY'
                        ? 'bg-[#FDF0EC] text-[#E85D4E]'
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

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Availability Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#182238] font-normal">
                Availability
              </h3>
              <button className="text-xs font-semibold text-[#E85D4E] hover:underline flex items-center gap-0.5">
                Edit <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#2E7D32]">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
              <span>Open for new students</span>
            </div>

            {/* Day Selector Circles */}
            <div className="flex items-center gap-2 pt-1">
              {days.map((day, idx) => {
                const isSelected = idx === 0 || idx === 1 || idx === 2; // sample active days
                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isSelected
                        ? 'bg-[#182238] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-400">
              Typical hours: 3:00–7:30 PM
            </p>
          </div>

          {/* Recent Messages Card */}
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#182238] font-normal">
                Recent messages
              </h3>
            
            </div>

            <p className="text-sm text-slate-500">
  No messages yet. Messages will appear here when available.
</p>
          </div>

        </div>

      </div>
    </div>
  );
}
