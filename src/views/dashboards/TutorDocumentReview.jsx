'use client';

import { useCallback, useEffect, useState } from 'react';

export default function TutorDocumentReview() {
  const [documents, setDocuments] = useState([]);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const load = useCallback(async () => {
    const response = await fetch('/api/reviewer/tutor-documents', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load tutor documents.');
    setDocuments(result.documents || []);
    setStorageConfigured(result.storageConfigured !== false);
  }, []);

  useEffect(() => { load().catch((reason) => setError(reason.message)); }, [load]);

  async function review(documentId, status) {
    setUpdatingId(documentId);
    setError('');
    try {
      const response = await fetch(`/api/reviewer/tutor-documents/${encodeURIComponent(documentId)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Review failed.');
      await load();
    } catch (reason) {
      setError(reason.message || 'Review failed.');
    } finally {
      setUpdatingId(null);
    }
  }

  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold text-[#182238]">Tutor document review</h2>
    <p className="mt-1 text-xs text-slate-500">Preview each private document before approving or rejecting it. Preview links expire after one minute.</p>
    {!storageConfigured && <p className="mt-2 text-xs text-amber-700">Configure the Storage secret key to preview uploaded evidence.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {documents.map((document) => <article key={document.id} className="rounded-xl border border-slate-200 p-3 text-sm">
        <p className="font-semibold">{document.tutor.name} · {document.type.replaceAll('_', ' ')}</p>
        <p className="text-xs text-slate-500">{document.tutor.email} · {(document.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
        {document.signedUrl && <details className="mt-3">
          <summary className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold">Preview document before review</summary>
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {document.contentType === 'application/pdf' ? <iframe title={`${document.type.replaceAll('_', ' ')} for ${document.tutor.name}`} src={document.signedUrl} className="h-96 w-full" /> : <img src={document.signedUrl} alt={`${document.type.replaceAll('_', ' ')} for ${document.tutor.name}`} className="max-h-96 w-full object-contain" />}
          </div>
        </details>}
        <div className="mt-3 flex gap-2">
          {document.signedUrl && <a href={document.signedUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Open file</a>}
          {['APPROVED', 'REJECTED'].map((status) => <button key={status} disabled={updatingId === document.id || (status === 'APPROVED' && !document.signedUrl)} onClick={() => review(document.id, status)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">{status === 'APPROVED' ? 'Approve document' : 'Reject'}</button>)}
        </div>
      </article>)}
      {!documents.length && <p className="text-sm text-slate-500">No tutor documents waiting for review.</p>}
    </div>
  </section>;
}
