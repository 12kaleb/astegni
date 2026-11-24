'use client';

import { useCallback, useEffect, useState } from 'react';

export default function AdminSafetyReview() {
  const [documents, setDocuments] = useState([]);
  const [consents, setConsents] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const [documentResponse, consentResponse, reportResponse, auditResponse] = await Promise.all([
      fetch('/api/admin/verification-documents', { cache: 'no-store' }),
      fetch('/api/admin/guardian-consents', { cache: 'no-store' }),
      fetch('/api/admin/reports', { cache: 'no-store' }),
      fetch('/api/admin/audit-logs', { cache: 'no-store' }),
    ]);
    const [documentResult, consentResult, reportResult, auditResult] = await Promise.all([documentResponse.json(), consentResponse.json(), reportResponse.json(), auditResponse.json()]);
    if (!documentResponse.ok || !consentResponse.ok || !reportResponse.ok || !auditResponse.ok) throw new Error(documentResult.error || consentResult.error || reportResult.error || auditResult.error || 'Could not load review queue.');
    setDocuments(documentResult.documents || []);
    setStorageConfigured(documentResult.storageConfigured !== false);
    setConsents(consentResult.consents || []);
    setReports(reportResult.reports || []);
    setAuditEvents(auditResult.events || []);
  }, []);

  useEffect(() => { load().catch((reason) => setError(reason.message)); }, [load]);

  async function review(url, payload) {
    const response = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Review failed.');
    await load();
  }

  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-[#182238]">Trust and safety review</h2>
    <p className="mt-1 text-xs text-slate-500">Private document links expire after one minute. Confirm guardian authorization through an independently verified contact before approving consent.</p>
    {!storageConfigured && <p className="mt-2 text-xs text-amber-700">Configure the Storage secret key to preview uploaded evidence.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <div className="mt-5 grid gap-6 lg:grid-cols-3">
      <div className="space-y-3"><h3 className="text-sm font-bold">Tutor documents ({documents.length})</h3>
        {documents.map((document) => <div key={document.id} className="rounded-xl border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{document.tutor.name} · {document.type.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{document.tutor.email} · {(document.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
          {document.signedUrl && <details className="mt-3">
            <summary className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold">Preview document before review</summary>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {document.contentType === 'application/pdf' ? <iframe title={`${document.type.replaceAll('_', ' ')} for ${document.tutor.name}`} src={document.signedUrl} className="h-96 w-full" /> : <img src={document.signedUrl} alt={`${document.type.replaceAll('_', ' ')} for ${document.tutor.name}`} className="max-h-96 w-full object-contain" />}
            </div>
          </details>}
          <div className="mt-3 flex gap-2">{document.signedUrl && <a href={document.signedUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Open file</a>}
            {['APPROVED', 'REJECTED'].map((status) => <button key={status} disabled={status === 'APPROVED' && !document.signedUrl} onClick={() => review(`/api/admin/verification-documents/${document.id}`, { status }).catch((reason) => setError(reason.message))} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">{status === 'APPROVED' ? 'Approve document' : 'Reject'}</button>)}</div>
        </div>)}
        {!documents.length && <p className="text-sm text-slate-500">No documents waiting.</p>}
      </div>
      <div className="space-y-3"><h3 className="text-sm font-bold">Guardian consent requests ({consents.length})</h3>
        {consents.map((consent) => <div key={consent.id} className="rounded-xl border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{consent.student.name} · {consent.student.email}</p><p className="text-xs text-slate-500">Guardian: {consent.guardianName} · {consent.guardianEmail}</p>
          <div className="mt-3 flex gap-2">{['APPROVED', 'REJECTED'].map((status) => <button key={status} onClick={() => review('/api/admin/guardian-consents', { consentId: consent.id, status }).catch((reason) => setError(reason.message))} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">{status === 'APPROVED' ? 'Approve after verification' : 'Reject'}</button>)}</div>
        </div>)}
        {!consents.length && <p className="text-sm text-slate-500">No guardian consent requests waiting.</p>}
      </div>
      <div className="space-y-3"><h3 className="text-sm font-bold">Safety reports ({reports.length})</h3>
        {reports.map((report) => <div key={report.id} className="rounded-xl border border-slate-200 p-3 text-sm">
          <p className="font-semibold">{report.category.replaceAll('_', ' ')} · {report.status}</p><p className="text-xs text-slate-500">From {report.reporter.name} about {report.reportedUser.name}</p><p className="mt-2 whitespace-pre-wrap text-xs">{report.details}</p>
          <div className="mt-3 flex flex-wrap gap-2">{['REVIEWING', 'RESOLVED', 'DISMISSED'].map((status) => <button key={status} onClick={() => review('/api/admin/reports', { reportId: report.id, status }).catch((reason) => setError(reason.message))} className="rounded-lg border px-2 py-1.5 text-[11px] font-semibold">{status}</button>)}</div>
        </div>)}
        {!reports.length && <p className="text-sm text-slate-500">No safety reports.</p>}
      </div>
    </div>
    <div className="mt-8 border-t border-slate-200 pt-5">
      <h3 className="text-sm font-bold">Recent admin actions</h3>
      <ul className="mt-3 space-y-2 text-xs text-slate-600">{auditEvents.slice(0, 10).map((event) => <li key={event.id} className="flex flex-wrap justify-between gap-2"><span>{event.actor?.name || 'Former account'} · {event.action} · {event.targetType}/{event.targetId}</span><time>{new Date(event.createdAt).toLocaleString()}</time></li>)}</ul>
      {!auditEvents.length && <p className="mt-2 text-xs text-slate-500">No recorded admin actions yet.</p>}
    </div>
  </section>;
}
