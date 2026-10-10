'use client';

import React from 'react';
import {
  Inbox,
  AlertOctagon,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Smile,
  Shield,
  Search,
  Bell
} from 'lucide-react';

export default function TeamDashboard() {
  const topMetrics = [
    {
      title: 'Open issues',
      value: '128',
      sub: '↓ 8 since yesterday',
      icon: Inbox,
      iconBg: 'bg-[#E8F0FE] text-[#1A73E8]',
    },
    {
      title: 'Urgent',
      value: '12',
      sub: '4 unassigned',
      subColor: 'text-[#C5221F]',
      icon: AlertOctagon,
      iconBg: 'bg-[#FCE8E6] text-[#C5221F]',
    },
    {
      title: 'Overdue',
      value: '6',
      sub: '2 breached this hour',
      subColor: 'text-[#B06000]',
      icon: Clock,
      iconBg: 'bg-[#FEF7E0] text-[#B06000]',
    },
    {
      title: 'Resolved today',
      value: '47',
      sub: '↑ 14% vs last Thu',
      subColor: 'text-[#137333]',
      icon: CheckCircle,
      iconBg: 'bg-[#E6F4EA] text-[#137333]',
    },
  ];

  const daysChart = [
    { day: 'Fri', created: 60, resolved: 45 },
    { day: 'Sat', created: 40, resolved: 38 },
    { day: 'Sun', created: 30, resolved: 28 },
    { day: 'Mon', created: 85, resolved: 70 },
    { day: 'Tue', created: 95, resolved: 82 },
    { day: 'Wed', created: 90, resolved: 88 },
    { day: 'Thu', created: 80, resolved: 75 },
  ];

  const priorityBoxes = [
    { label: 'Urgent', count: 12, bg: 'bg-[#FCE8E6] text-[#C5221F]' },
    { label: 'High', count: 31, bg: 'bg-[#FEF7E0] text-[#B06000]' },
    { label: 'Normal', count: 72, bg: 'bg-[#E8F0FE] text-[#1A73E8]' },
    { label: 'Low', count: 13, bg: 'bg-[#E6F4EA] text-[#137333]' },
  ];

  const categories = [
    { name: 'Login & access', count: 38 },
    { name: 'Billing & refunds', count: 29 },
    { name: 'Service disruption', count: 24 },
    { name: 'Account changes', count: 21 },
    { name: 'Other requests', count: 16 },
  ];

  const specialists = [
    { name: 'Elena Ruiz', sub: '7 open · 2 urgent', pct: 72, color: 'bg-[#137333]' },
    { name: 'Marcus Lee', sub: '11 open · 3 urgent', pct: 94, color: 'bg-[#B06000]' },
    { name: 'Priya Shah', sub: '8 open · 1 urgent', pct: 78, color: 'bg-[#1A73E8]' },
    { name: 'Noah Williams', sub: '13 open · 2 urgent', pct: 100, color: 'bg-[#C5221F]' },
  ];

  const escalations = [
    {
      code: 'SUP-4821',
      title: 'Refund missing after cancellation',
      detail: 'VIP · 42 min overdue',
      badge: 'Escalated',
      badgeColor: 'bg-[#FCE8E6] text-[#C5221F]',
    },
    {
      code: 'SUP-4798',
      title: 'Locked out after MFA reset',
      detail: 'Enterprise · 18 min remaining',
      badge: 'Complaint',
      badgeColor: 'bg-[#FEF7E0] text-[#B06000]',
    },
    {
      code: 'SUP-4814',
      title: 'Intermittent API timeouts',
      detail: 'Incident linked · 31 reports',
      badge: 'Service issue',
      badgeColor: 'bg-[#F3E8FD] text-[#9334E6]',
    },
  ];

  const recentActivity = [
    {
      specialist: 'Elena Ruiz',
      action: 'resolved',
      ticket: 'SUP-4803 · Duplicate charge on annual plan',
      time: '9:42 AM',
    },
    {
      specialist: 'Marcus Lee',
      action: 'assigned to Priya',
      ticket: 'SUP-4825 · Cannot update billing address',
      time: '9:18 AM',
    },
    {
      specialist: 'Priya Shah',
      action: 'replied to customer',
      ticket: 'SUP-4817 · Data export is incomplete',
      time: '8:56 AM',
    },
    {
      specialist: 'Noah Williams',
      action: 'escalated',
      ticket: 'SUP-4821 · Refund missing after cancellation',
      time: '8:31 AM',
    },
  ];

  return (
    <div className="space-y-7 animate-fadeIn max-w-[1240px] mx-auto text-[#182238]">
      
      {/* Top 4 KPI Metric Cards */}
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

      {/* Row 2: Issue Volume & Resolution & Tickets by priority */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Issue volume & resolution (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Issue volume & resolution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Created vs resolved · Last 7 days</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              Open analytics <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {daysChart.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    className="w-1/2 bg-[#D3E3FD] rounded-t-sm"
                    style={{ height: `${d.created}%` }}
                    title={`Created: ${d.created}`}
                  />
                  <div
                    className="w-1/2 bg-[#1A73E8] rounded-t-sm"
                    style={{ height: `${d.resolved}%` }}
                    title={`Resolved: ${d.resolved}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D3E3FD]" />
              <span>Created 669</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
              <span>Resolved 602</span>
            </div>
            <span className="ml-auto text-[11px] font-semibold text-[#137333]">
              90% resolution rate
            </span>
          </div>
        </div>

        {/* Tickets by priority & category (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Tickets by priority & category</h2>
              <p className="text-xs text-slate-400 mt-0.5">128 open issues</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              Review queue <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          {/* 4 Priority boxes */}
          <div className="grid grid-cols-4 gap-2">
            {priorityBoxes.map((p, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${p.bg} text-center`}>
                <div className="text-lg font-bold font-serif">{p.count}</div>
                <span className="text-[10px] font-medium block opacity-90">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Category List */}
          <div className="divide-y divide-slate-100 pt-2 text-xs">
            {categories.map((c, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-[#182238] font-medium">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-600 font-mono text-[11px]">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Assigned Workload, SLA Health & Sentiment, Escalations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Assigned workload */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Assigned workload</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active issues by specialist</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              Balance <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {specialists.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#182238]">{s.name}</span>
                  <span className="text-slate-400 text-[11px] font-mono">{s.pct}%</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{s.sub}</span>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA health & sentiment */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#182238]">SLA health & sentiment</h3>
                <p className="text-xs text-slate-400 mt-0.5">Current service quality</p>
              </div>
              <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
                View quality <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              <div className="p-2.5 rounded-xl bg-[#E6F4EA] text-center">
                <span className="text-sm font-bold font-serif text-[#137333]">93.4%</span>
                <span className="text-[9px] block text-[#137333] font-semibold mt-0.5">Within SLA</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FEF7E0] text-center">
                <span className="text-sm font-bold font-serif text-[#B06000]">8</span>
                <span className="text-[9px] block text-[#B06000] font-semibold mt-0.5">At risk</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCE8E6] text-center">
                <span className="text-sm font-bold font-serif text-[#C5221F]">6</span>
                <span className="text-[9px] block text-[#C5221F] font-semibold mt-0.5">Breached</span>
              </div>
            </div>
          </div>

          {/* Customer Sentiment Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Customer Sentiment</span>
              <span className="text-[11px] font-semibold text-[#137333]">+38 net positive</span>
            </div>
            
            <div className="w-full h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#137333] h-full" style={{ width: '62%' }} title="62% positive" />
              <div className="bg-[#B06000] h-full" style={{ width: '24%' }} title="24% neutral" />
              <div className="bg-[#C5221F] h-full" style={{ width: '14%' }} title="14% negative" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-medium">
              <span>62% positive</span>
              <span>24% neutral</span>
              <span>14% negative</span>
            </div>
          </div>
        </div>

        {/* Escalations & complaints */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Escalations & complaints</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 waiting for review</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              Review all <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {escalations.map((esc, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#182238]">{esc.code} · {esc.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{esc.detail}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${esc.badgeColor}`}>
                    {esc.badge}
                  </span>
                  <button className="px-3 py-1 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 hover:bg-slate-50">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Recent ticket activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#182238]">Recent ticket activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live updates across the support queue</p>
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
                  <td className="py-3 font-semibold text-[#182238] w-40">{r.specialist}</td>
                  <td className="py-3 text-slate-400 w-32">{r.action}</td>
                  <td className="py-3 font-medium text-[#182238]">{r.ticket}</td>
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
