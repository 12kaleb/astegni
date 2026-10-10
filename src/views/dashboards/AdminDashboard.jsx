'use client';

import React from 'react';
import {
  Activity,
  Users,
  ShieldAlert,
  Zap,
  ArrowRight,
  Search,
  Bell,
  Download,
  Settings,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Server,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const topMetrics = [
    {
      title: 'Platform uptime',
      value: '99.98%',
      sub: '↑ 0.03% vs last 30 days',
      icon: Activity,
      iconBg: 'bg-[#E6F4EA] text-[#137333]',
    },
    {
      title: 'Active users',
      value: '8,426',
      sub: '74 online now',
      icon: Users,
      iconBg: 'bg-[#E8F0FE] text-[#1A73E8]',
    },
    {
      title: 'Open alerts',
      value: '7',
      sub: '2 require attention',
      subColor: 'text-[#C5221F]',
      icon: ShieldAlert,
      iconBg: 'bg-[#FCE8E6] text-[#C5221F]',
    },
    {
      title: 'Connected apps',
      value: '24',
      sub: '23 healthy · 1 degraded',
      icon: Zap,
      iconBg: 'bg-[#F3E8FD] text-[#9334E6]',
    },
  ];

  const services = [
    { name: 'Core API', uptime: '99.99%', status: 'Operational', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
    { name: 'Identity service', uptime: '99.97%', status: 'Operational', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
    { name: 'Workflow engine', uptime: '98.42%', status: 'Degraded', statusBg: 'bg-[#FEF7E0] text-[#B06000]' },
    { name: 'Data pipeline', uptime: '99.95%', status: 'Operational', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
  ];

  const securityAlerts = [
    {
      title: 'Unusual sign-in pattern detected',
      time: '12 min ago',
      badge: 'High',
      badgeColor: 'bg-[#FCE8E6] text-[#C5221F]',
      iconColor: 'text-[#C5221F]',
    },
    {
      title: 'SAML certificate expires in 14 days',
      time: '2h ago',
      badge: 'Medium',
      badgeColor: 'bg-[#FEF7E0] text-[#B06000]',
      iconColor: 'text-[#B06000]',
    },
    {
      title: '3 failed admin login attempts',
      time: '4h ago',
      isReviewButton: true,
      iconColor: 'text-[#1A73E8]',
    },
  ];

  const roles = [
    { name: 'Standard member', count: 632, pct: 65 },
    { name: 'Team manager', count: 348, pct: 40 },
    { name: 'Workspace admin', count: 124, pct: 20 },
    { name: 'System admin', count: 48, pct: 10 },
  ];

  const integrations = [
    { name: 'Okta', type: 'Directory sync', status: 'Healthy', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
    { name: 'Salesforce', type: 'CRM', status: 'Healthy', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
    { name: 'Workday', type: 'HRIS', status: 'Delayed 18m', statusBg: 'bg-[#FEF7E0] text-[#B06000]' },
    { name: 'Snowflake', type: 'Warehouse', status: 'Healthy', statusBg: 'bg-[#E6F4EA] text-[#137333]' },
  ];

  const auditLogs = [
    { actor: 'Maya Chen', activity: 'Updated SSO enforcement policy', area: 'Security', time: '2 min ago' },
    { actor: 'Idris Bell', activity: 'Assigned Billing Admin role', area: 'Users', time: '18 min ago' },
    { actor: 'System', activity: 'Completed directory sync · 1,248 users', area: 'Integration', time: '42 min ago' },
    { actor: 'Jonas Reed', activity: 'Rotated production API key', area: 'Integration', time: '1h ago' },
  ];

  return (
    <div className="space-y-7 animate-fadeIn max-w-[1240px] mx-auto text-[#182238]">
      
      {/* Top Meta Sub-bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="font-bold text-sm text-[#182238]">System Admin</span>
          <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
            Thursday, September 24 · Global production environment
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
            Platform command center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor health, secure access, and keep the organization running smoothly.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all">
            <Download className="w-3.5 h-3.5" />
            Export report
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl text-xs font-semibold shadow-sm transition-all">
            <Settings className="w-3.5 h-3.5" />
            System settings
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{metric.title}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${metric.iconBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-2">
                <div className="text-3xl font-serif text-[#182238]">{metric.value}</div>
                <span className={`text-[11px] font-medium ${metric.subColor || 'text-slate-400'}`}>
                  {metric.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Platform Health & Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform health Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Platform health</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live service status · Updated just now</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              View status <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Health Donut / Gauge */}
            <div className="w-24 h-24 rounded-full border-4 border-[#C8E6C9] flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-[#182238]">98</span>
              <span className="text-[9px] font-bold text-[#2E7D32] tracking-wider uppercase">HEALTHY</span>
            </div>

            {/* Service Rows */}
            <div className="flex-1 w-full space-y-3">
              {services.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${svc.status === 'Operational' ? 'bg-[#2E7D32]' : 'bg-[#E5A93C]'}`} />
                    <span className="font-medium text-[#182238]">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">{svc.uptime}</span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${svc.statusBg}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security alerts Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#182238]">Security alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">7 open · 2 high priority</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center gap-0.5">
              Open security center <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {securityAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 shrink-0 ${alert.iconColor}`} />
                  <div>
                    <h4 className="text-xs font-semibold text-[#182238]">{alert.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
                  </div>
                </div>

                {alert.isReviewButton ? (
                  <button className="px-3 py-1 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    Review
                  </button>
                ) : (
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${alert.badgeColor}`}>
                    {alert.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Users & role management, Integrations, System configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Users & role management */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Users & role management</h3>
              <p className="text-xs text-slate-400 mt-0.5">8,426 licensed users</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              Manage <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100">
            <div>
              <span className="text-lg font-serif font-bold text-[#137333]">8,109</span>
              <span className="text-[10px] block text-slate-400 font-medium">Active</span>
            </div>
            <div>
              <span className="text-lg font-serif font-bold text-[#1A73E8]">184</span>
              <span className="text-[10px] block text-slate-400 font-medium">Invited</span>
            </div>
            <div>
              <span className="text-lg font-serif font-bold text-[#C5221F]">133</span>
              <span className="text-[10px] block text-slate-400 font-medium">Suspended</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {roles.map((r, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 text-[11px]">{r.name}</span>
                  <span className="font-semibold text-[11px]">{r.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A73E8] rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">Integrations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sync health across connected systems</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              View all 24 <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 pt-1">
            {integrations.map((integ, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                    {integ.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#182238]">{integ.name}</h4>
                    <p className="text-[10px] text-slate-400">{integ.type}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${integ.statusBg}`}>
                  {integ.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System configuration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-normal text-[#182238]">System configuration</h3>
              <p className="text-xs text-slate-400 mt-0.5">Policy and capacity overview</p>
            </div>
            <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
              Configure <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Storage used</span>
                <span className="text-slate-400 font-mono text-[11px]">6.8 TB of 10 TB</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1A73E8] rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">API quota</span>
                <span className="text-slate-400 font-mono text-[11px]">4.2M of 8M</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#9334E6] rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Automation runs</span>
                <span className="text-slate-400 font-mono text-[11px]">78k of 100k</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#D97706] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Production region</span>
              <span className="text-xs font-semibold text-[#182238]">US East · Virginia</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Recent audit activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#182238]">Recent audit activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Administrative changes across the platform</p>
          </div>
          <button className="text-xs font-semibold text-[#1A73E8] hover:underline flex items-center">
            View full audit log <ArrowRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2 font-medium">Actor</th>
                <th className="py-2 font-medium">Activity</th>
                <th className="py-2 font-medium">Area</th>
                <th className="py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-[#182238]">{log.actor}</td>
                  <td className="py-3 text-slate-600">{log.activity}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {log.area}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
