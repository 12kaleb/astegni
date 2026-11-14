'use client';

import StudentDashboard from './dashboards/StudentDashboard';
import TutorDashboard from './dashboards/TutorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import TeamDashboard from './dashboards/TeamDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import BookingInbox from '../components/BookingInbox';

/**
 * Renders the correct dashboard based on the signed-in user's role.
 * Each role sees only their own isolated portal — no cross-role switching.
 */
export default function DashboardView({
  user,
  onFindTutor = () => {},
  onSelectTutor = () => {},
  selectedTutorIds = [],
  onJoinLesson = () => {},
}) {
  const role = user?.role; // lowercase names matching the database roles

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {(role === 'student' || role === 'tutor') && <BookingInbox role={role} />}
      {role === 'student' && (
        <StudentDashboard
          user={user}
          onFindTutor={onFindTutor}
          onSelectTutor={onSelectTutor}
          selectedTutorIds={selectedTutorIds}
          onJoinLesson={onJoinLesson}
        />
      )}

      {role === 'tutor' && <TutorDashboard user={user} />}
      {role === 'admin' && <AdminDashboard />}
      {role === 'support_specialist' && <TeamDashboard />}
      {role === 'manager' && <ManagerDashboard />}

      {/* Fallback: unknown or missing role */}
      {!['student', 'tutor', 'admin', 'support_specialist', 'manager'].includes(role) && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold text-[#0A1428]">Your account role isn&apos;t set up yet.</p>
            <p className="text-sm text-slate-500">Please contact support or try signing in again.</p>
          </div>
        </div>
      )}
    </div>
  );
}
