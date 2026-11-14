'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, BookOpen, Ticket, ClipboardList, RefreshCw,
  AlertTriangle, Shield, Check, X,
} from 'lucide-react';
import AdminSafetyReview from './AdminSafetyReview';

const ROLE_LABELS = {
  STUDENT: 'Student', TUTOR: 'Tutor', ADMIN: 'Admin',
  SUPPORT_SPECIALIST: 'Support', MANAGER: 'Manager',
};

const ROLE_COLORS = {
  STUDENT: 'bg-blue-100 text-blue-700', TUTOR: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-red-100 text-red-700', SUPPORT_SPECIALIST: 'bg-amber-100 text-amber-700',
  MANAGER: 'bg-purple-100 text-purple-700',
};

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const res  = await fetch('/api/admin/overview', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load data.');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function updateVerification(userId, status) {
    setUpdatingId(userId);
    try {
      const res  = await fetch(`/api/admin/tutors/${encodeURIComponent(userId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      // Refresh data
      await loadData();
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <RefreshCw className="w-7 h-7 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="font-semibold text-[#0A1428]">{error}</p>
          <button onClick={loadData} className="btn btn-primary btn-sm">Retry</button>
        </div>
      </div>
    );
  }

  const { metrics, roleBreakdown, recentUsers, pendingTutors, lessonsByWeek, pendingVerifications, admin } = data;
  const maxWeeklyLessons = Math.max(...lessonsByWeek.map((item) => item.count), 1);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-7 text-[#182238]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-extrabold text-2xl text-[#0A1428] tracking-tight">Admin Command Center</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                {admin?.name}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-10">
              Astegni Platform · {new Date().toLocaleDateString('en-ET', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E2D8] bg-white text-xs font-semibold text-slate-600 hover:border-red-300 transition-all self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Top KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',     value: metrics.totalUsers,      sub: `${metrics.students} students · ${metrics.tutors} tutors`, icon: Users,        style: 'bg-blue-100 text-blue-600'    },
            { label: 'Lesson Sessions', value: metrics.totalLessons,    sub: `${metrics.confirmedLessons} confirmed`,                    icon: BookOpen,     style: 'bg-emerald-100 text-emerald-600' },
            { label: 'Support Tickets', value: metrics.totalTickets,    sub: `${metrics.openTickets} open · ${metrics.escalatedTickets} escalated`, icon: Ticket, style: metrics.openTickets > 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500' },
            { label: 'Assignments',     value: metrics.totalAssignments,sub: `${metrics.completedAssignments} completed`,                icon: ClipboardList, style: 'bg-purple-100 text-purple-600' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{c.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.style}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#182238] leading-none">{c.value}</div>
                <span className="text-[11px] text-slate-400 font-medium">{c.sub}</span>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* User role breakdown */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-lg text-[#182238]">Users by Role</h2>
              <p className="text-xs text-slate-400 mt-0.5">{metrics.totalUsers} total registered accounts</p>
            </div>
            <div className="space-y-3">
              {roleBreakdown.map((r) => (
                <div key={r.role} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ROLE_COLORS[r.role] || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[r.role] || r.role}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">{r.count} · {r.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1428] rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor verification status */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg text-[#182238]">Tutor Verification</h2>
                <p className="text-xs text-slate-400 mt-0.5">{metrics.verifiedTutors} verified · {pendingVerifications} pending verifications</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{metrics.verifiedTutors} Verified</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{pendingVerifications} Pending</span>
              </div>
            </div>

            <div className="space-y-2">
              {pendingTutors.map((tutor) => {
                  const isUpdating = updatingId === tutor.userId;
                  return (
                    <div key={tutor.userId} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {tutor.user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#182238]">{tutor.user.name}</p>
                          <p className="text-[10px] text-slate-400">{tutor.user.email} · Joined {timeAgo(tutor.user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isUpdating}
                          onClick={() => updateVerification(tutor.userId, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {isUpdating ? '…' : <><X className="inline w-3 h-3 mr-1" />Reject</>}
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => updateVerification(tutor.userId, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {isUpdating ? '…' : <><Check className="inline w-3 h-3 mr-1" />Approve</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              {pendingTutors.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">No tutors are waiting for review.</p>
              )}
            </div>
          </div>
        </div>

        {/* Scheduled lessons by week */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-lg text-[#182238]">Lessons per Week</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scheduled lessons over the last eight weeks</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
            {lessonsByWeek.map(({ week, count }) => (
              <div key={week} className="flex flex-col items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-600">{count}</span>
                <div className="w-full h-24 bg-slate-100 rounded-lg flex items-end overflow-hidden">
                  <div className="w-full bg-emerald-500 rounded-lg" style={{ height: `${Math.max((count / maxWeeklyLessons) * 100, count ? 8 : 0)}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{new Date(`${week}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Users */}
        <AdminSafetyReview />

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-lg text-[#182238]">Recent Registrations</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest accounts across all roles</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Email</th>
                  <th className="py-2 text-left font-medium">Role</th>
                  <th className="py-2 text-left font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-semibold text-[#182238]">{u.name}</td>
                    <td className="py-3 text-slate-500">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{timeAgo(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
