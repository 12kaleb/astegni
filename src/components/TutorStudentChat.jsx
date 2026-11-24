'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

export default function TutorStudentChat({ tutorId, studentId, user, compact = false }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const query = `?studentId=${encodeURIComponent(studentId)}`;

  const load = useCallback(async () => {
    const response = await fetch(`/api/conversations/${encodeURIComponent(tutorId)}/messages${query}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load messages.');
    setMessages(data.messages || []);
    setError('');
  }, [query, tutorId]);

  useEffect(() => {
    let active = true;
    load().catch((reason) => { if (active) setError(reason.message || 'Could not load messages.'); });
    const interval = setInterval(() => load().catch((reason) => { if (active) setError(reason.message || 'Could not refresh messages.'); }), 5000);
    return () => { active = false; clearInterval(interval); };
  }, [load]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch(`/api/conversations/${encodeURIComponent(tutorId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, text: message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send this message.');
      setMessages((current) => [...current, data.message]);
      setText('');
    } catch (reason) {
      setError(reason.message || 'Could not send this message.');
    } finally {
      setSending(false);
    }
  }

  return <section className={`flex min-h-[320px] flex-col rounded-3xl border border-[#EAE6DF] bg-white ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
    <div className="border-b border-slate-100 pb-3"><h2 className="font-bold text-[#0A1428]">Messages</h2><p className="mt-1 text-xs text-slate-500">Talk about learning goals and needs before planning lessons.</p></div>
    <div className="my-3 flex-1 space-y-3 overflow-y-auto">
      {!messages.length && <p className="py-6 text-center text-xs text-slate-400">Start the conversation to understand what the student wants to learn.</p>}
      {messages.map((message) => {
        const mine = message.authorId === user?.id;
        return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'rounded-br-sm bg-[#0A1428] text-white' : 'rounded-bl-sm bg-[#F4EFE6] text-[#1C2434]'}`}>
          <p className="whitespace-pre-wrap break-words text-xs">{message.text}</p><p className={`mt-1 text-[9px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>{message.senderName} · {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div></div>;
      })}
      <div ref={endRef} />
    </div>
    {error && <p role="alert" className="mb-2 text-xs text-rose-700">{error}</p>}
    <form onSubmit={send} className="flex items-end gap-2 border-t border-slate-100 pt-3">
      <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} rows={2} placeholder="Write a message…" className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#E05A47]/30" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
      <button type="submit" disabled={sending || !text.trim()} aria-label="Send message" className="rounded-xl bg-[#E05A47] p-2.5 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
    </form>
  </section>;
}
