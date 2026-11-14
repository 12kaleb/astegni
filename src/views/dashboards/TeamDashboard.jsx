'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  AlertOctagon,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Shield,
  Search,
  RefreshCw,
  User,
  Tag,
  Clock,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  URGENT: { bg: 'bg-red-100 text-red-700',   dot: 'bg-red-500',    label: 'Urgent' },
  HIGH:   { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',  label: 'High'   },
  NORMAL: { bg: 'bg-blue-100 text-blue-700',  dot: 'bg-blue-500',   label: 'Normal' },
  LOW:    { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400',  label: 'Low'    },
};

const STATUS_STYLES = {
  OPEN:      { bg: 'bg-blue-50 text-blue-700 border-blue-200',    label: 'Open'      },
  ESCALATED: { bg: 'bg-red-50 text-red-700 border-red-200',       label: 'Escalated' },
  RESOLVED:  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Resolved' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeamDashboard() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('queue');   // 'queue' | 'my' | 'resolved'
  const [search, setSearch]     = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null); // ticket detail modal
  const [updatingId, setUpdatingId] = useState(null);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError('');
      const res  = await fetch('/api/team/tickets', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load tickets.');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Update ticket ────────────────────────────────────────────────────────────
  async function updateTicket(id, patch) {
    setUpdatingId(id);
    try {
      const res  = await fetch('/api/team/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Optimistically update local state
      setData((prev) => {
        if (!prev) return prev;
        const tickets = prev.tickets.map((t) =>
          t.id === id ? { ...t, ...json.ticket } : t
        );
        const open       = tickets.filter((t) => t.status === 'OPEN');
        const escalated  = tickets.filter((t) => t.status === 'ESCALATED');
        const resolved   = tickets.filter((t) => t.status === 'RESOLVED');
        const myTickets  = tickets.filter((t) => t.specialistId === prev.specialist?.id && t.status !== 'RESOLVED');
        const unassigned = open.filter((t) => !t.specialistId);
        const dayAgo     = new Date(Date.now() - 86400000);
        const resolvedToday = resolved.filter((t) => new Date(t.updatedAt) > dayAgo);
        const priorities = prev.metrics.priorities;
        return {
          ...prev,
          tickets,
          openTickets: open,
          escalatedTickets: escalated,
          myTickets,
          metrics: {
            ...prev.metrics,
            openCount: open.length + escalated.length,
            urgentCount: [...open, ...escalated].filter((t) => t.priority === 'URGENT').length,
            escalatedCount: escalated.length,
            unassignedCount: unassigned.length,
            resolvedTodayCount: resolvedToday.length,
            resolvedTotal: resolved.length,
          },
        };
      });

      if (selectedTicket?.id === id) {
        setSelectedTicket((prev) => prev ? { ...prev, ...json.ticket } : prev);
      }
    } catch (e) {
      alert('Update failed: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Derived ticket lists ─────────────────────────────────────────────────────
  function filterTickets(list) {
    return list.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.ticketCode.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      return matchSearch && matchPriority;
    });
  }

  const queueTickets   = data ? filterTickets([...data.openTickets, ...data.escalatedTickets].sort((a, b) => {
    const order = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
    return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
  })) : [];

  const myTickets      = data ? filterTickets(data.myTickets)                              : [];
  const resolvedList   = data ? filterTickets(data.tickets.filter((t) => t.status === 'RESOLVED')) : [];

  const activeList     = activeTab === 'queue' ? queueTickets : activeTab === 'my' ? myTickets : resolvedList;

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#1A73E8] animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading support desk…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="font-semibold text-[#0A1428]">Failed to load support desk</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={loadData} className="btn btn-primary btn-sm mt-2">Retry</button>
        </div>
      </div>
    );
  }

  const { metrics, volumeByDay, categories, specialist } = data;
  const maxVol = Math.max(...volumeByDay.map((d) => d.created), 1);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-7 text-[#182238]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-extrabold text-2xl text-[#0A1428] tracking-tight">Support Desk</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                {specialist?.name ?? 'Specialist'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-10">
              Addis Ababa · {new Date().toLocaleDateString('en-ET', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E8E2D8] bg-white text-xs font-semibold text-slate-600 hover:border-blue-300 transition-all self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Open Issues',
              value: metrics.openCount,
              sub: `${metrics.unassignedCount} unassigned`,
              subColor: metrics.unassignedCount > 0 ? 'text-amber-600' : 'text-slate-400',
              icon: Inbox,
              iconStyle: 'bg-blue-100 text-blue-600',
            },
            {
              label: 'Urgent',
              value: metrics.urgentCount,
              sub: `${metrics.escalatedCount} escalated`,
              subColor: metrics.urgentCount > 0 ? 'text-red-600' : 'text-slate-400',
              icon: AlertOctagon,
              iconStyle: 'bg-red-100 text-red-600',
            },
            {
              label: 'My Open Tickets',
              value: myTickets.length,
              sub: `assigned to me`,
              subColor: 'text-slate-400',
              icon: User,
              iconStyle: 'bg-indigo-100 text-indigo-600',
            },
            {
              label: 'Resolved Today',
              value: metrics.resolvedTodayCount,
              sub: `${metrics.resolvedTotal} total resolved`,
              subColor: 'text-emerald-600',
              icon: CheckCircle,
              iconStyle: 'bg-emerald-100 text-emerald-600',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.iconStyle}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#182238] leading-none">{card.value}</div>
                  <span className={`text-[11px] font-medium mt-1 block ${card.subColor}`}>{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Charts Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Volume chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg text-[#182238]">Issue Volume & Resolution</h2>
                <p className="text-xs text-slate-400 mt-0.5">Created vs resolved · Last 7 days</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {metrics.resolvedTotal > 0
                  ? Math.round((metrics.resolvedTotal / (metrics.resolvedTotal + metrics.openCount)) * 100)
                  : 0}% resolved
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-100">
              {volumeByDay.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      className="w-1/2 bg-blue-200 rounded-t-sm transition-all"
                      style={{ height: `${(d.created / maxVol) * 100}%` }}
                      title={`Created: ${d.created}`}
                    />
                    <div
                      className="w-1/2 bg-blue-600 rounded-t-sm transition-all"
                      style={{ height: `${(d.resolved / maxVol) * 100}%` }}
                      title={`Resolved: ${d.resolved}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-200 block" />
                <span>Created {data.tickets.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                <span>Resolved {metrics.resolvedTotal}</span>
              </div>
            </div>
          </div>

          {/* Priority & Category breakdown */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-lg text-[#182238]">By Priority & Category</h2>
              <p className="text-xs text-slate-400 mt-0.5">{metrics.openCount} open issues</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Urgent', count: metrics.priorities.urgent, style: 'bg-red-50 text-red-700' },
                { label: 'High',   count: metrics.priorities.high,   style: 'bg-amber-50 text-amber-700' },
                { label: 'Normal', count: metrics.priorities.normal, style: 'bg-blue-50 text-blue-700' },
                { label: 'Low',    count: metrics.priorities.low,    style: 'bg-slate-50 text-slate-600' },
              ].map((p) => (
                <div key={p.label} className={`p-2.5 rounded-xl ${p.style} text-center cursor-pointer ${filterPriority === p.label.toUpperCase() ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                  onClick={() => setFilterPriority(filterPriority === p.label.toUpperCase() ? 'ALL' : p.label.toUpperCase())}>
                  <div className="text-xl font-bold">{p.count}</div>
                  <span className="text-[10px] font-semibold block opacity-80">{p.label}</span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 pt-1 text-xs">
              {categories.slice(0, 5).map((c) => (
                <div key={c.name} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 block" />
                    <span className="font-medium text-[#182238]">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-500 font-mono">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Ticket Queue ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              {[
                { id: 'queue',    label: `Queue (${queueTickets.length})` },
                { id: 'my',       label: `My Tickets (${myTickets.length})` },
                { id: 'resolved', label: `Resolved (${resolvedList.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-[#0A1428] shadow-sm' : 'text-slate-500 hover:text-[#0A1428]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket ID or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-slate-50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Ticket List */}
          {activeList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {search ? 'No tickets match your search.' : 'No tickets in this queue.'}
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((ticket) => {
                const pStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.NORMAL;
                const sStyle = STATUS_STYLES[ticket.status]     || STATUS_STYLES.OPEN;
                const isUpdating = updatingId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    {/* Priority dot + code */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pStyle.dot}`} />
                      <span className="text-[11px] font-bold text-slate-500 font-mono">{ticket.ticketCode}</span>
                    </div>

                    {/* Title + category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#182238] truncate">{ticket.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ticket.category} · {timeAgo(ticket.createdAt)}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pStyle.bg}`}>{pStyle.label}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${sStyle.bg}`}>{sStyle.label}</span>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {ticket.status !== 'RESOLVED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateTicket(ticket.id, { status: 'RESOLVED' })}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          {isUpdating ? '…' : '✓ Resolve'}
                        </button>
                      )}
                      {ticket.status === 'OPEN' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateTicket(ticket.id, { status: 'ESCALATED' })}
                          className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          Escalate
                        </button>
                      )}
                      {ticket.status === 'RESOLVED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => updateTicket(ticket.id, { status: 'OPEN' })}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Ticket Detail Modal ──────────────────────────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 font-mono">{selectedTicket.ticketCode}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.NORMAL).bg}`}>
                    {(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.NORMAL).label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.OPEN).bg}`}>
                    {(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.OPEN).label}
                  </span>
                </div>
                <h3 className="font-bold text-[#0A1428] mt-1.5 text-base leading-snug">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detail */}
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
              {selectedTicket.detail}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Category</span>
                <span className="font-semibold text-[#182238]">{selectedTicket.category}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Reported</span>
                <span className="font-semibold text-[#182238]">{timeAgo(selectedTicket.createdAt)}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Assigned To</span>
                <span className="font-semibold text-[#182238]">{selectedTicket.specialist?.name ?? '— Unassigned'}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-400 font-medium block mb-1">Priority</span>
                <span className="font-semibold text-[#182238]">{selectedTicket.priority}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  disabled={updatingId === selectedTicket.id}
                  onClick={async () => {
                    await updateTicket(selectedTicket.id, { status: 'RESOLVED' });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              )}
              {selectedTicket.status === 'OPEN' && (
                <button
                  disabled={updatingId === selectedTicket.id}
                  onClick={() => updateTicket(selectedTicket.id, { status: 'ESCALATED' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Escalate
                </button>
              )}
              {selectedTicket.status === 'RESOLVED' && (
                <button
                  disabled={updatingId === selectedTicket.id}
                  onClick={() => updateTicket(selectedTicket.id, { status: 'OPEN' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-600 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 transition-all"
                >
                  Reopen
                </button>
              )}
              {/* Priority quick-change */}
              <select
                disabled={updatingId === selectedTicket.id}
                value={selectedTicket.priority}
                onChange={(e) => updateTicket(selectedTicket.id, { priority: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer"
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>

              <button onClick={() => setSelectedTicket(null)} className="ml-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
