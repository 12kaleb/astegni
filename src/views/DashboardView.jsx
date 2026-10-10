'use client';

import StudentDashboard from './dashboards/StudentDashboard';
import TutorDashboard from './dashboards/TutorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import TeamDashboard from './dashboards/TeamDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';

export default function DashboardView({
  user,
  currency = 'ETB',
  onFindTutor = () => {},
  onJoinLesson = () => {},
}) {
  const allowedRoles = ['student', 'tutor', 'admin', 'team', 'manager'];
  const activeRole = allowedRoles.includes(user?.role)
    ? user.role
    : 'student';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-6">
        {activeRole === 'student' && (

             


<StudentDashboard
user={user}
onFindTutor={onFindTutor}
onJoinLesson={onJoinLesson}
/>

          
        )}

        {activeRole === 'tutor' && <TutorDashboard currency={currency} user={user} />}
        {activeRole === 'admin' && <AdminDashboard />}
        {activeRole === 'team' && <TeamDashboard />}
        {activeRole === 'manager' && <ManagerDashboard />}
      </div>
    </div>
  );
}