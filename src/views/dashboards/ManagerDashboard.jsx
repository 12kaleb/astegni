'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TutorDocumentReview from './TutorDocumentReview';
import {
  TrendingUp, CheckSquare, Target, ArrowRight, FileText,
  Users, RefreshCw, AlertTriangle, Check, X, GraduationCap,
  BookOpen, Ticket, ClipboardList,
} from 'lucide-react';

const APPROVAL_TYPE_STYLES = {
  PTO:     { bg: 'bg-blue-50 text-blue-700 border-blue-200',   label: 'PTO'     },
  EXPENSE: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Expense' },
  GOAL:    { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Goal' },
};

const STATUS_STYLES = {
  PENDING:  { bg: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400'  },
  APPROVED: { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  REJECTED: { bg: 'bg-red-100 text-red-700',         dot: 'bg-red-500'    },
};

const GOAL_STATUS = {
  ON_TRACK:  { bg: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500', label: 'On Track'  },
  AT_RISK:   { bg: 'bg-amber-50 text-amber-700',     bar: 'bg-amber-500',   label: 'At Risk'   },
  OFF_TRACK: { bg: 'bg-red-50 text-red-700',         bar: 'bg-red-500',     label: 'Off Track' },
};

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ManagerDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'approvals' | 'goals'
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const res  = await fetch('/api/manager/overview', { cache: 'no-store' });
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

  async function handleApproval(approvalId, status) {
    setUpdatingId(approvalId);
    try {
      const res  = await fetch('/api/manager/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData((prev) => ({
        ...prev,
        approvals: prev.approvals.map((a) =>
          a.id === approvalId ? { ...a, status: json.approval.status } : a
        ),
        metrics: {
          ...prev.metrics,
          pendingApprovalsCount: prev.approvals.filter((a) => a.id !== approvalId && a.status === 'PENDING').length,
        },
      }));
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
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

  const { metrics, approvals, goals, manager } = data;
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const goalStats = metrics.goalStats;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-7 text-[#182238]">
        <TutorDocumentReview />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-extrabold text-2xl text-[#0A1428] tracking-tight">Manager Workspace</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                {manager?.name}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-10">
              Astegni Operations · {new Date().toLocaleDateString('en-ET', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E2D8] bg-white text-xs font-semibold text-slate-600 hover:border-indigo-300 transition-all self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',       value: metrics.totalUsers,            sub: `${metrics.students} students · ${metrics.tutors} tutors`, icon: Users,        style: 'bg-blue-100 text-blue-600' },
            { label: 'Active Lessons',    value: metrics.upcomingLessons,        sub: `${metrics.totalLessons} total sessions booked`,            icon: BookOpen,     style: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending Approvals', value: metrics.pendingApprovalsCount,  sub: `${approvals.length} total requests`,                       icon: CheckSquare,  style: metrics.pendingApprovalsCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500' },
            { label: 'Goals On Track',    value: goalStats.onTrack,              sub: `${goalStats.atRisk} at risk · ${goalStats.offTrack} off track`, icon: Target, style: 'bg-purple-100 text-purple-600' },
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

        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Verified Tutors', value: metrics.verifiedTutors,  total: metrics.tutors,         color: 'bg-emerald-500' },
            { label: 'Open Tickets',    value: metrics.openTickets,      total: metrics.totalTickets,   color: 'bg-red-400'     },
            { label: 'Pending Approvals',value: metrics.pendingApprovalsCount, total: null,             color: 'bg-amber-500'   },
            { label: 'Lesson Sessions', value: metrics.upcomingLessons,  total: metrics.totalLessons,   color: 'bg-indigo-500'  },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-[#182238]">{s.value ?? '—'}</span>
                <span className="text-[11px] text-slate-400 font-mono">of {s.total ?? '—'}</span>
              </div>
              {s.total > 0 && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.round(((s.value ?? 0) / s.total) * 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tab Nav */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 w-fit">
          {[
            { id: 'overview',  label: 'Overview'  },
            { id: 'approvals', label: `Approvals (${pendingApprovals.length})` },
            { id: 'goals',     label: `Goals (${goals.length})` },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-[#0A1428] shadow-sm' : 'text-slate-500 hover:text-[#0A1428]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Goal Progress */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg text-[#182238]">Q4 Goals</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{goals.length} active · {goalStats.onTrack} on track</p>
                </div>
                <div className="flex gap-2">
                  {[['bg-emerald-100 text-emerald-700', `${goalStats.onTrack} On Track`], ['bg-amber-100 text-amber-700', `${goalStats.atRisk} At Risk`], ['bg-red-100 text-red-700', `${goalStats.offTrack} Off Track`]].map(([c, l]) => (
                    <span key={l} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{l}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {goals.map((g) => {
                  const s = GOAL_STATUS[g.status] || GOAL_STATUS.ON_TRACK;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#182238]">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{g.progressPct}%</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.bg}`}>{s.label}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${g.progressPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg text-[#182238]">Pending Approvals</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{pendingApprovals.length} awaiting your review</p>
                </div>
              </div>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">All caught up! No pending approvals.</div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((a) => {
                    const t = APPROVAL_TYPE_STYLES[a.type] || APPROVAL_TYPE_STYLES.GOAL;
                    const isUpdating = updatingId === a.id;
                    return (
                      <div key={a.id} className="p-3.5 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.bg}`}>{t.label}</span>
                              <span className="text-[10px] text-slate-400">{a.requester?.name}</span>
                            </div>
                            <p className="text-xs font-semibold text-[#182238] mt-1">{a.title}</p>
                            <p className="text-[10px] text-slate-400">{a.detail}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(a.createdAt)}</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button disabled={isUpdating} onClick={() => handleApproval(a.id, 'APPROVED')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all">
                            <Check className="w-3 h-3" /> {isUpdating ? '…' : 'Approve'}
                          </button>
                          <button disabled={isUpdating} onClick={() => handleApproval(a.id, 'REJECTED')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold hover:bg-red-100 disabled:opacity-50 transition-all">
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── APPROVALS TAB ── */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="font-bold text-lg text-[#182238]">All Approvals</h2>
            {approvals.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No approvals yet.</p>
            ) : (
              <div className="space-y-2">
                {approvals.map((a) => {
                  const t = APPROVAL_TYPE_STYLES[a.type] || APPROVAL_TYPE_STYLES.GOAL;
                  const s = STATUS_STYLES[a.status] || STATUS_STYLES.PENDING;
                  const isUpdating = updatingId === a.id;
                  return (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[#182238]">{a.title}</p>
                          <p className="text-[10px] text-slate-400">{a.detail} · {a.requester?.name} · {timeAgo(a.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${t.bg}`}>{t.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.bg}`}>{a.status}</span>
                        {a.status === 'PENDING' && (
                          <>
                            <button disabled={isUpdating} onClick={() => handleApproval(a.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 disabled:opacity-50">
                              {isUpdating ? '…' : '✓'}
                            </button>
                            <button disabled={isUpdating} onClick={() => handleApproval(a.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold hover:bg-red-100 disabled:opacity-50">
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── GOALS TAB ── */}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-[#182238]">Q4 Goals Tracker</h2>
              <div className="flex gap-2">
                {[['bg-emerald-100 text-emerald-700', goalStats.onTrack, 'On Track'], ['bg-amber-100 text-amber-700', goalStats.atRisk, 'At Risk'], ['bg-red-100 text-red-700', goalStats.offTrack, 'Off Track']].map(([c, n, l]) => (
                  <span key={l} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c}`}>{n} {l}</span>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              {goals.map((g) => {
                const s = GOAL_STATUS[g.status] || GOAL_STATUS.ON_TRACK;
                return (
                  <div key={g.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#182238]">{g.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.bg}`}>{s.label}</span>
                        <span className="font-mono text-slate-400">{g.progressPct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${g.progressPct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400">{g.quarter} · {timeAgo(g.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
