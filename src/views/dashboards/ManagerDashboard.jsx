'use client';

import React from 'react';
import {
  TrendingUp,
  Layers,
  CheckSquare,
  Target,
  ArrowRight,
  Download,
  Plus,
  Search,
  Bell,
  ChevronRight,
  FileText,
  Calendar,
  Users
} from 'lucide-react';

export default function ManagerDashboard() {
  const topMetrics = [
    {
      title: 'Team performance',
      value: '92%',
      sub: '↑ 4 pts this month',
      subColor: 'text-[#137333]',
      icon: TrendingUp,
      iconBg: 'bg-[#E6F4EA] text-[#137333]',
    },
    {
      title: 'Capacity used',
      value: '84%',
      sub: '2 teammates near limit',
      subColor: 'text-[#B06000]',
      icon: Layers,
      iconBg: 'bg-[#FEF7E0] text-[#B06000]',
    },
    {
      title: 'Pending approvals',
      value: '6',
      sub: '3 due today',
      subColor: 'text-[#C5221F]',
      icon: CheckSquare,
      iconBg: 'bg-[#FCE8E6] text-[#C5221F]',
    },
    {
      title: 'Goals on track',
      value: '14 / 17',
      sub: '82% progressing well',
      icon: Target,
      iconBg: 'bg-[#F3E8FD] text-[#9334E6]',
    },
  ];

  const weeklyBars = [
    { label: 'W1', value: 50 },
    { label: 'W2', value: 65 },
    { label: 'W3', value: 58 },
    { label: 'W4', value: 72 },
    { label: 'W5', value: 68 },
    { label: 'W6', value: 80 },
    { label: 'W7', value: 75 },
    { label: 'W8', value: 92, active: true },
  ];

  const approvals = [
    {
      title: 'Time off · Elena Ruiz',
      detail: 'Sep 28–Oct 2',
      badge: 'PTO',
      badgeColor: 'bg-[#E8F0FE] text-[#1A73E8]',
    },
    {
      title: 'Expense report · Marcus Lee',
      detail: '$1,284.60',
      badge: 'Expense',
      badgeColor: 'bg-[#FEF7E0] text-[#B06000]',
    },
    {
      title: 'Goal update · Priya Shah',
      detail: 'Q4 Enablement plan',
      badge: 'Goal',
      badgeColor: 'bg-[#F3E8FD] text-[#9334E6]',
    },
  ];

  const workloads = [
    { name: 'Elena Ruiz', role: 'Product Ops', pct: 88, color: 'bg-[#137333]' },
    { name: 'Marcus Lee', role: 'Solutions', pct: 102, color: 'bg-[#B06000]' },
    { name: 'Priya Shah', role: 'Enablement', pct: 71, color: 'bg-[#1A73E8]' },
    { name: 'Noah Williams', role: 'Analytics', pct: 94, color: 'bg-[#137333]' },
  ];

  const goals = [
    { name: 'Reduce onboarding time', pct: 86, color: 'bg-[#137333]' },
    { name: 'Improve forecast accuracy', pct: 72, color: 'bg-[#1A73E8]' },
    { name: 'Automate weekly reporting', pct: 48, color: 'bg-[#B06000]' },
  ];

  const recentActivity = [
    { name: 'Elena Ruiz', action: 'completed milestone', item: 'Launch readiness review', time: '9:42 AM' },
    { name: 'Marcus Lee', action: 'submitted approval', item: 'Client travel expenses', time: '9:18 AM' },
    { name: 'Priya Shah', action: 'updated goal', item: 'Onboarding time reduction', time: 'Yesterday' },
    { name: 'Noah Williams', action: 'shared report', item: 'Weekly capacity forecast', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-7 animate-fadeIn max-w-[1240px] mx-auto text-[#182238]">
      
      {/* Top Meta Sub-bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="font-bold text-sm text-[#182238]">Manager workspace</span>
          <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
            Operations Excellence · 12 direct reports
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Northstar..."
              className="pl-8 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full w-48 sm:w-64 focus:outline-none focus:border-slate-400"
            />
          </div>
          <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
            AM
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#182238] tracking-tight">
            Good morning, Avery
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your team is on track. Three items need your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" />
            Team report
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" />
            Add goal
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{m.title}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-serif text-[#182238]">{m.value}</div>
                <span className={`text-[11px] font-medium ${m.subColor || 'text-slate-400'}`}>
                  {m.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Team Performance Chart & Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Team performance chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Team performance</h2>
              <p className="text-xs text-slate-400 mt-0.5">Weekly output vs target · Last 8 weeks</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              Open analytics <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-100">
            {weeklyBars.map((b, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className={`w-full max-w-[42px] rounded-t-sm transition-all ${
                    b.active ? 'bg-[#1A73E8]' : 'bg-[#E8F0FE]'
                  }`}
                  style={{ height: `${b.value}%` }}
                />
                <span className="text-[10px] text-slate-400 font-medium">{b.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
              <span>Completed work</span>
            </div>
            <span className="ml-auto text-[11px] font-semibold text-[#137333]">
              +12% over 8 weeks
            </span>
          </div>
        </div>

        {/* Approvals (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Approvals</h2>
              <p className="text-xs text-slate-400 mt-0.5">6 awaiting your review</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              Review all <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 pt-1">
            {approvals.map((appr, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#182238]">{appr.title}</h4>
                    <p className="text-[10px] text-slate-400">{appr.detail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${appr.badgeColor}`}>
                    {appr.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Team Workload, Goals, Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Team workload */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Team workload</h3>
              <p className="text-xs text-slate-400 mt-0.5">Planned capacity this week</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              Balance <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {workloads.map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#182238]">{w.name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{w.pct}%</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{w.role}</span>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${w.color}`} style={{ width: `${Math.min(w.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Goals</h3>
              <p className="text-xs text-slate-400 mt-0.5">Q3 · 17 active goals</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              View goals <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="p-2.5 rounded-xl bg-[#E6F4EA] text-center">
              <span className="text-sm font-bold font-serif text-[#137333]">14</span>
              <span className="text-[9px] block text-[#137333] font-semibold mt-0.5">On track</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FEF7E0] text-center">
              <span className="text-sm font-bold font-serif text-[#B06000]">2</span>
              <span className="text-[9px] block text-[#B06000] font-semibold mt-0.5">At risk</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FCE8E6] text-center">
              <span className="text-sm font-bold font-serif text-[#C5221F]">1</span>
              <span className="text-[9px] block text-[#C5221F] font-semibold mt-0.5">Off track</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {goals.map((g, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#182238] font-medium text-[11px]">{g.name}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{g.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Attendance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Today · Thursday, Sep 24</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              View calendar <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="p-2.5 rounded-xl bg-[#E6F4EA] text-center">
              <span className="text-sm font-bold font-serif text-[#137333]">9</span>
              <span className="text-[9px] block text-[#137333] font-semibold mt-0.5">Present</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F0FE] text-center">
              <span className="text-sm font-bold font-serif text-[#1A73E8]">2</span>
              <span className="text-[9px] block text-[#1A73E8] font-semibold mt-0.5">Remote</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FEF7E0] text-center">
              <span className="text-sm font-bold font-serif text-[#B06000]">1</span>
              <span className="text-[9px] block text-[#B06000] font-semibold mt-0.5">Out</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Upcoming time off
            </span>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-[#182238]">Elena Ruiz</span>
              <span className="text-[11px] text-slate-400 font-mono">Sep 28–Oct 2</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium text-[#182238]">Noah Williams</span>
              <span className="text-[11px] text-slate-400 font-mono">Oct 5</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Recent team activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#182238]">Recent team activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Updates across your team</p>
          </div>
          <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
            View all activity <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-100">
              {recentActivity.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-[#182238] w-40">{r.name}</td>
                  <td className="py-3 text-slate-400 w-36">{r.action}</td>
                  <td className="py-3 font-medium text-[#182238]">{r.item}</td>
                  <td className="py-3 text-slate-400 text-right font-mono text-[11px]">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
