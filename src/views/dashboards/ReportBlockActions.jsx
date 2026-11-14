'use client';

import { useState } from 'react';

export default function ReportBlockActions({ targetUserId, onBlocked }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function act(kind) {
    if (kind === 'block' && !window.confirm('Block this student? New lessons and assignments will be unavailable.')) return;
    const details = kind === 'report' ? window.prompt('Describe the concern (at least 10 characters):') : null;
    if (kind === 'report' && (!details || details.trim().length < 10)) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(kind === 'report' ? '/api/safety/reports' : '/api/safety/blocks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'report' ? { reportedUserId: targetUserId, category: 'OTHER', details } : { userId: targetUserId }),
      });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Action failed.');
      setMessage(kind === 'report' ? 'Report submitted.' : 'Student blocked.');
      if (kind === 'block') onBlocked?.(targetUserId);
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <div className="flex items-center gap-3 text-[11px]">
    <button disabled={busy} onClick={() => act('report')} className="text-slate-500 underline disabled:opacity-50">Report</button>
    <button disabled={busy} onClick={() => act('block')} className="text-slate-500 underline disabled:opacity-50">Block</button>
    {message && <span role="status" className="text-slate-600">{message}</span>}
  </div>;
}
