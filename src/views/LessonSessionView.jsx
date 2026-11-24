'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
  Send,
  Clock,
  BookOpen,
  ChevronRight,
  X,
  Plus,
  Star,
  Users,
  Maximize2,
  Minimize2,
  PhoneOff,
  AlertCircle,
  CheckCheck,
  Pencil,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Addis_Ababa',
  });
}

function isGoogleMeetUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'meet.google.com';
  } catch {
    return false;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Session timer displayed in the header */
function SessionTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const origin = startedAt ? new Date(startedAt).getTime() : Date.now();
    const tick = () => setElapsed(Math.floor((Date.now() - origin) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="font-mono text-sm tabular-nums text-slate-600">
      {formatDuration(elapsed)}
    </span>
  );
}

/** Chat panel: shared messages between tutor & student */
function ChatPanel({ role, messages, onSend, readOnly }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || readOnly) return;
    if (await onSend(trimmed)) setText('');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-6">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderRole === role;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                  isMe
                    ? 'bg-[#0A1428] text-white rounded-br-sm'
                    : 'bg-[#F4EFE6] text-[#1C2434] rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-slate-400'}`}>
                  {msg.senderName} · {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!readOnly ? <div className="mt-3 flex items-end gap-2 border-t border-[#EAE6DF] pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1C2434] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E05A47]/30"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 rounded-xl bg-[#E05A47] p-2.5 text-white transition-opacity disabled:opacity-40 hover:bg-[#C94635]"
        >
          <Send className="h-4 w-4" />
        </button>
      </div> : <p className="mt-3 border-t border-[#EAE6DF] pt-3 text-center text-xs text-slate-400">This lesson chat is closed.</p>}
    </div>
  );
}

function AssignmentsPanel({ lessonId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadAssignments = useCallback(async () => {
    const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/assignments`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load assignments.');
    setAssignments(data.assignments || []);
  }, [lessonId]);

  useEffect(() => {
    loadAssignments().catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [loadAssignments]);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/assignments`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not upload this PDF.');
      await loadAssignments();
      setMessage('PDF added to assignments.');
    } catch (error) {
      setMessage(error.message || 'Could not upload this PDF.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex h-full flex-col">
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-xs text-slate-400">Assignments and PDFs shared for this student.</p>
      <label className={`shrink-0 cursor-pointer rounded-lg bg-[#E05A47] px-3 py-2 text-[10px] font-bold text-white ${busy ? 'pointer-events-none opacity-50' : ''}`}>
        {busy ? 'Uploading…' : 'Upload PDF'}
        <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={busy} onChange={upload} />
      </label>
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto pr-1">
      {loading && <p className="py-5 text-center text-xs text-slate-400">Loading assignments…</p>}
      {!loading && assignments.length === 0 && <p className="py-5 text-center text-xs text-slate-400">No assignments or PDFs yet.</p>}
      {assignments.map((item) => (
        <div key={item.id} className="rounded-xl border border-[#1E3352] bg-white/5 p-3">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#F29B78]" />
            <div className="min-w-0 flex-1">
              <p className="break-words text-xs font-semibold text-white">{item.fileName || item.title}</p>
              <p className="mt-1 text-[10px] text-slate-400">{item.status} · {new Date(item.createdAt).toLocaleDateString()}</p>
              {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] font-bold text-[#F29B78] underline">Open PDF</a>}
            </div>
          </div>
        </div>
      ))}
    </div>
    {message && <p role="status" className="mt-2 text-[10px] text-slate-300">{message}</p>}
    <p className="mt-2 text-[10px] text-slate-500">PDF only · up to 8 MB</p>
  </div>;
}

/** Notes panel: private notes for the tutor */
function NotesPanel({ notes, onAdd, onToggle }) {
  const [text, setText] = useState('');

  const addNote = async () => {
    const trimmed = text.trim();
    if (trimmed && await onAdd(trimmed)) setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
        {notes.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-6">
            No notes yet. Add a note to track key points.
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2.5 rounded-xl border border-[#EAE6DF] p-2.5 hover:bg-[#FAF7F2] transition-colors"
          >
            <button
              type="button"
              onClick={() => onToggle(note.id)}
              className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              {note.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
            <p className={`text-xs leading-snug ${note.done ? 'line-through text-slate-400' : 'text-[#1C2434]'}`}>
              {note.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end gap-2 border-t border-[#EAE6DF] pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) { e.preventDefault(); void addNote(); }
            }
          }}
          placeholder="Add a session note… (Enter)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E05A47]/30"
        />
        <button
          onClick={() => void addNote()}
          disabled={!text.trim()}
          className="shrink-0 rounded-xl bg-[#0A1428] p-2.5 text-white transition-opacity disabled:opacity-40 hover:bg-[#132238]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Agenda panel: lesson topics / agenda items */
function AgendaPanel({ agenda, onToggle, onAdd, readOnly }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  const addTopic = async () => {
    const trimmed = text.trim();
    if (trimmed && await onAdd(trimmed)) { setText(''); setAdding(false); }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
        {agenda.length === 0 && (
          <p className="text-center text-xs text-slate-400 mt-6">
            No agenda items. Add topics to cover in this session.
          </p>
        )}
        {agenda.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
              item.done
                ? 'border-emerald-100 bg-emerald-50/60'
                : 'border-[#EAE6DF] bg-white hover:border-[#E05A47]/30'
            }`}
          >
            {!readOnly && <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="mt-0.5 shrink-0"
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-slate-400">{idx + 1}</span>
                </div>
              )}
            </button>}
            <p className={`text-xs font-medium leading-snug ${item.done ? 'line-through text-slate-400' : 'text-[#1C2434]'}`}>
              {item.text}
            </p>
            {item.done && (
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-emerald-600">Done</span>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (adding ? (
        <div className="mt-3 flex items-end gap-2 border-t border-[#EAE6DF] pt-3">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); void addTopic(); }
              if (e.key === 'Escape') { setAdding(false); setText(''); }
            }}
            placeholder="Add topic…"
            className="flex-1 rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E05A47]/30"
          />
          <button
            onClick={() => void addTopic()}
            className="shrink-0 rounded-xl bg-[#E05A47] px-3 py-2 text-xs font-bold text-white hover:bg-[#C94635]"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-500 hover:border-[#E05A47] hover:text-[#E05A47] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Topic
        </button>
      ))}
    </div>
  );
}

/** Post-session review modal */
function ReviewModal({ lesson, user, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isTutor = user?.role === 'tutor';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ rating, comment });
    } catch (err) {
      setError(err.message || 'Could not submit review.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] p-6">
          <div>
            <h2 className="font-serif text-xl text-[#182238] font-normal">Session complete</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTutor ? 'Great work! Add notes for this student.' : 'How was your lesson?'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isTutor && (
            <div>
              <label className="text-xs font-bold text-[#0A1428] uppercase tracking-wider block mb-2">
                Rate this lesson
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${n <= rating ? 'text-[#E5A93C] fill-[#E5A93C]' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-slate-600">{rating}/5</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#0A1428] uppercase tracking-wider block mb-2">
              {isTutor ? 'Session notes (optional)' : 'What did you enjoy or learn? (optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={isTutor ? 'Key topics covered, student progress, homework set…' : 'Share your experience with this tutor…'}
              className="w-full resize-none rounded-xl border border-[#EAE6DF] bg-[#FAF7F2] px-4 py-3 text-sm text-[#1C2434] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E05A47]/30"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm flex-1">
              Skip for now
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm flex-1 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : isTutor ? 'Save Notes' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LessonSessionView({ lessonId, user }) {
  const isTutor = user?.role === 'tutor';

  // ── Lesson data ────────────────────────────────────────────────────────────
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionError, setSessionError] = useState('');
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [meetingLinkMessage, setMeetingLinkMessage] = useState('');
  const [meetingLinkBusy, setMeetingLinkBusy] = useState(false);

  // ── Session state ──────────────────────────────────────────────────────────
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' | 'notes' | 'agenda'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);

  // ── Notes ──────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);

  // ── Agenda ─────────────────────────────────────────────────────────────────
  const [agenda, setAgenda] = useState([]);

  const loadSessionItems = useCallback(async () => {
    const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/session`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not refresh lesson activity.');
    setSessionError('');
    setMessages(data.messages || []);
    setAgenda(data.agenda || []);
    setNotes(data.notes || []);
    setLesson((current) => current ? { ...current, status: data.status, startedAt: data.startedAt, completedAt: data.completedAt } : current);
    if (data.status === 'COMPLETED') {
      setSessionStarted(true);
      setSessionStartedAt(data.startedAt);
      setSessionEnded(true);
    } else if (isTutor && data.startedAt) {
      setSessionStarted(true);
      setSessionStartedAt(data.startedAt);
    }
    return true;
  }, [isTutor, lessonId]);

  // ── Load lesson ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    let active = true;

    async function fetchLesson() {
      try {
        const [res, sessionRes] = await Promise.all([
          fetch(`/api/lessons/${encodeURIComponent(lessonId)}`, { cache: 'no-store' }),
          fetch(`/api/lessons/${encodeURIComponent(lessonId)}/session`, { cache: 'no-store' }),
        ]);
        const [data, session] = await Promise.all([res.json(), sessionRes.json()]);
        if (!res.ok) throw new Error(data.error || 'Could not load lesson.');
        if (!sessionRes.ok) throw new Error(session.error || 'Could not load lesson activity.');
        if (active) {
          setLesson(data.lesson);
          setMeetingLinkInput(isGoogleMeetUrl(data.lesson.meetingUrl) ? data.lesson.meetingUrl : '');
          setMessages(session.messages || []);
          setAgenda(session.agenda || []);
          setNotes(session.notes || []);
          setSessionStarted(Boolean(data.lesson.startedAt) && isTutor);
          setSessionStartedAt(data.lesson.startedAt || null);
          setSessionEnded(data.lesson.status === 'COMPLETED');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLesson();
    return () => { active = false; };
  }, [isTutor, lessonId]);

  const shouldPollSession = Boolean(lesson && lesson.status !== 'COMPLETED');

  useEffect(() => {
    if (!shouldPollSession) return;
    const interval = setInterval(() => {
      loadSessionItems().catch((reason) => setSessionError(reason.message || 'Could not refresh lesson activity.'));
    }, 5000);
    return () => clearInterval(interval);
  }, [shouldPollSession, loadSessionItems]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const sendSessionRequest = async (method, body) => {
    setSessionError('');
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/session`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      if (!response.ok) {
        setSessionError(data.error || 'Could not update lesson activity.');
        return false;
      }
      await loadSessionItems();
      return true;
    } catch (reason) {
      setSessionError(reason.message || 'Could not update lesson activity.');
      return false;
    }
  };

  const saveGoogleMeetLink = async (event) => {
    event.preventDefault();
    const meetingUrl = meetingLinkInput.trim();
    if (!meetingUrl || meetingLinkBusy) return;
    setMeetingLinkBusy(true);
    setMeetingLinkMessage('');
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/meeting-link`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save the Google Meet link.');
      setLesson((current) => current ? { ...current, meetingUrl: data.lesson.meetingUrl } : current);
      setMeetingLinkMessage('Google Meet link saved for this class.');
    } catch (reason) {
      setMeetingLinkMessage(reason.message || 'Could not save the Google Meet link.');
    } finally {
      setMeetingLinkBusy(false);
    }
  };

  const handleStartSession = useCallback(async () => {
    setSessionError('');
    if (isTutor) {
      try {
        const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'START_SESSION' }),
        });
        const data = await response.json();
        if (!response.ok) {
          setSessionError(data.error || 'Could not start this teaching session.');
          return;
        }
        setLesson(data.lesson);
        setSessionStartedAt(data.lesson.startedAt);
      } catch (reason) {
        setSessionError(reason.message || 'Could not start this teaching session.');
        return;
      }
    } else {
      setSessionStartedAt(lesson?.startedAt || new Date().toISOString());
    }
    setSessionStarted(true);
    setSessionEnded(false);
  }, [isTutor, lesson?.startedAt, lessonId]);

  const handleEndSession = useCallback(async () => {
    if (!isTutor) {
      setSessionEnded(true);
      return;
    }
    setSessionError('');
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'COMPLETE_SESSION' }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSessionError(data.error || 'Could not complete this lesson.');
        return;
      }
      setLesson(data.lesson);
      setSessionEnded(true);
      setShowReview(true);
      await loadSessionItems();
    } catch (reason) {
      setSessionError(reason.message || 'Could not complete this lesson.');
    }
  }, [isTutor, lessonId, loadSessionItems]);

  const handleSendMessage = (text) => sendSessionRequest('POST', { type: 'CHAT', text });
  const handleAddNote = (text) => sendSessionRequest('POST', { type: 'NOTE', text });
  const handleAddAgenda = (text) => sendSessionRequest('POST', { type: 'AGENDA', text });
  const handleToggleNote = (id) => sendSessionRequest('PATCH', { type: 'NOTE', id, done: !notes.find((note) => note.id === id)?.done });
  const handleToggleAgenda = (id) => sendSessionRequest('PATCH', { type: 'AGENDA', id, done: !agenda.find((item) => item.id === id)?.done });

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (isTutor) {
      if (!comment.trim()) { setShowReview(false); return; }
      const saved = await sendSessionRequest('POST', { type: 'NOTE', text: comment });
      if (!saved) throw new Error('Could not save session notes.');
      setShowReview(false);
      return;
    }
    const res = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not submit review.');
    setLesson((current) => current ? { ...current, review: data.review } : current);
    setShowReview(false);
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E05A47]/30 border-t-[#E05A47]" />
          <p className="text-sm font-medium text-slate-500">Loading your lesson…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-4">
        <div className="mx-auto max-w-sm space-y-4 rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="font-bold text-[#0A1428]">Could not load lesson</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <a href="/dashboard" className="btn btn-primary btn-sm w-full">Go to dashboard</a>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const counterparty = isTutor ? lesson.student : lesson.tutor;
  const agendaDone = agenda.filter((a) => a.done).length;
  const agendaTotal = agenda.length;

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-[#0A1428] text-white overflow-hidden">

      {/* ── TOP HEADER BAR ── */}
      <header className="shrink-0 flex items-center justify-between gap-4 border-b border-[#1E3352] bg-[#132238] px-4 py-3">
        {/* Left: Back + lesson info */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/dashboard"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-bold text-white">{lesson.title || 'Live Lesson'}</h1>
              {lesson.status === 'CONFIRMED' && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONFIRMED
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-slate-400">
              {isTutor ? 'Student' : 'Tutor'}: <span className="font-semibold text-slate-300">{counterparty?.name || '—'}</span>
              {lesson.topic && <> · <span>{lesson.topic}</span></>}
              {lesson.durationMins && <> · <span>{lesson.durationMins} min</span></>}
            </p>
          </div>
        </div>

        {/* Centre: Timer & agenda progress */}
        <div className="hidden md:flex items-center gap-4">
          {sessionStarted && (
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-[#E05A47]" />
              <SessionTimer startedAt={sessionStartedAt} />
            </div>
          )}
          {agendaTotal > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#E5A93C]" />
              <span className="text-xs font-semibold text-slate-300">
                {agendaDone}/{agendaTotal} topics
              </span>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* End session */}
          {sessionStarted && !sessionEnded && isTutor && (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-lg"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          )}
        </div>
      </header>

      {sessionError && <div role="alert" className="shrink-0 border-b border-rose-500/30 bg-rose-950/80 px-4 py-2 text-center text-xs text-rose-200">{sessionError}</div>}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── VIDEO / TEACHING AREA ── */}
        <main
          className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
            videoExpanded ? 'w-full' : ''
          }`}
        >
          {/* Video stage */}
          <div className="relative flex-1 bg-[#0D1B2E] overflow-hidden">

            {/* Pre-session overlay */}
            {!sessionStarted && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A1428]/95 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-[#1E3352] bg-[#132238] p-8 text-center shadow-2xl mx-4">
                  {/* Avatar / icon */}
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E05A47]/10 border-2 border-[#E05A47]/30">
                    <Users className="h-9 w-9 text-[#E05A47]" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 mb-4">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Ready to start</span>
                  </div>

                  <h2 className="font-serif text-2xl text-white font-normal mb-1">{lesson.title || 'Your Lesson'}</h2>
                  <p className="text-sm text-slate-400 mb-1">
                    with <span className="font-semibold text-white">{counterparty?.name || '—'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mb-6">
                    Scheduled: {formatTime(lesson.scheduledAt)}
                    {lesson.durationMins && ` · ${lesson.durationMins} min`}
                  </p>

                  {/* Agenda preview */}
                  {agenda.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-[#1E3352] bg-[#0A1428]/60 p-4 text-left space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Today&apos;s agenda</p>
                      {agenda.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2 text-xs text-slate-300">
                          <span className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 shrink-0">
                            {idx + 1}
                          </span>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {lesson.meetingUrl ? (
                    <>
                    {isTutor && lesson.status === 'CONFIRMED' && <form onSubmit={saveGoogleMeetLink} className="mb-4 rounded-2xl border border-[#1E3352] bg-[#0A1428]/60 p-4 text-left">
                      <label className="block text-xs font-semibold text-slate-200">Google Meet for this class
                        <input type="url" value={meetingLinkInput} onChange={(event) => setMeetingLinkInput(event.target.value)} placeholder="https://meet.google.com/abc-defg-hij" className="mt-2 w-full rounded-xl border border-[#33445C] bg-[#132238] px-3 py-2.5 text-xs text-white placeholder:text-slate-500" />
                      </label>
                      <div className="mt-2 flex items-center justify-between gap-3"><p className="text-[10px] text-slate-400">Create a Meet, paste its link, and save it for your student.</p><button type="submit" disabled={meetingLinkBusy || !meetingLinkInput.trim()} className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40">{meetingLinkBusy ? 'Saving…' : 'Save Meet link'}</button></div>
                      {meetingLinkMessage && <p role="status" className="mt-2 text-[10px] text-emerald-300">{meetingLinkMessage}</p>}
                    </form>}
                    <button
                      onClick={handleStartSession}
                      className="btn btn-primary w-full font-bold shadow-xl shadow-[#E05A47]/30 flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      {isTutor ? 'Start Teaching Session' : 'Join Lesson'}
                    </button>
                    </>
                  ) : (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-400">
                      <AlertCircle className="mx-auto h-5 w-5 mb-2" />
                      Meeting link not available yet.
                      {!isTutor && ' Your tutor needs to confirm the lesson first.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session ended overlay */}
            {sessionEnded && !showReview && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A1428]/95">
                <div className="text-center space-y-4">
                  <CheckCheck className="mx-auto h-14 w-14 text-emerald-400" />
                  <h2 className="font-serif text-2xl text-white font-normal">{lesson.status === 'COMPLETED' ? 'Session complete!' : 'You left the lesson'}</h2>
                  <p className="text-sm text-slate-400">{lesson.status === 'COMPLETED' ? 'Great work. Your lesson has ended.' : 'Your tutor can mark the lesson complete after the session.'}</p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <a href="/dashboard" className="btn btn-outline btn-sm text-white border-white/30 hover:bg-white/10">
                      Back to dashboard
                    </a>
                    {isTutor && lesson.status === 'COMPLETED' && <button
                      onClick={() => setShowReview(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Add session notes
                    </button>}
                    {!isTutor && lesson.status === 'COMPLETED' && !lesson.review && <button onClick={() => setShowReview(true)} className="btn btn-primary btn-sm">Leave a review</button>}
                    {!isTutor && lesson.review && <span className="text-xs font-semibold text-emerald-300">Review submitted</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Google Meet or Jitsi classroom */}
            {sessionStarted && !sessionEnded && (
              <>
                {isGoogleMeetUrl(lesson.meetingUrl) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0D1B2E] p-6 text-center">
                    <Video className="h-12 w-12 text-[#F29B78]" />
                    <div><h2 className="text-lg font-bold text-white">Your Google Meet is ready</h2><p className="mt-2 max-w-md text-sm text-slate-300">Open Google Meet in a new tab to join the live lesson. Keep this workspace open for chat and lesson materials.</p></div>
                    <a href={lesson.meetingUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#E05A47] px-6 py-3 text-sm font-bold text-white hover:bg-[#C94635]">Join Google Meet</a>
                  </div>
                ) : (
                  <iframe
                    src={lesson.meetingUrl}
                    title={`Video lesson: ${lesson.title || 'Tutoring session'}`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0 bg-black"
                  />
                )}

                {/* Expand toggle */}
                <button
                  onClick={() => setVideoExpanded((v) => !v)}
                  className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10"
                  title={videoExpanded ? 'Compress' : 'Expand'}
                >
                  {videoExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>

          {/* ── MEDIA CONTROLS BAR ── */}
          {sessionStarted && !sessionEnded && (
            <div className="shrink-0 flex items-center justify-center gap-3 bg-[#132238] border-t border-[#1E3352] px-4 py-3">
              <span className="hidden sm:inline text-[10px] text-slate-400">Use the call controls in the video window.</span>
              <button
                onClick={() => { setSidebarTab('chat'); setSidebarOpen(true); }}
                className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-white/15 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                Chat
              </button>

              {/* Private tutor notes */}
              {isTutor && <button
                onClick={() => { setSidebarTab('notes'); setSidebarOpen(true); }}
                className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-white/15 transition-colors"
              >
                <Pencil className="h-5 w-5" />
                Notes
              </button>}

              {/* End session */}
              {isTutor ? <button
                onClick={handleEndSession}
                className="flex flex-col items-center gap-1 rounded-2xl bg-rose-600 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/40"
              ><PhoneOff className="h-5 w-5" />End &amp; complete</button> : <button
                onClick={handleEndSession}
                className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-white/15"
              >Leave lesson</button>}
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        {sidebarOpen && (
          <aside className="hidden md:flex w-80 shrink-0 flex-col border-l border-[#1E3352] bg-[#0F1E35]">
            {/* Sidebar tabs */}
            <div className="flex shrink-0 items-center gap-1 border-b border-[#1E3352] p-2">
              {[
                { id: 'chat', icon: MessageSquare, label: 'Chat', badge: messages.filter((m) => m.senderRole !== 'system').length },
                { id: 'assignments', icon: FileText, label: 'Work' },
                { id: 'agenda', icon: BookOpen, label: 'Agenda', badge: agendaDone > 0 ? agendaDone : null },
                ...(isTutor ? [{ id: 'notes', icon: FileText, label: 'Notes', badge: notes.filter((n) => !n.done).length || null }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition-colors ${
                    sidebarTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span className="rounded-full bg-[#E05A47] px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-hidden p-4">
              {sidebarTab === 'chat' && (
                <ChatPanel
                  role={user?.role || 'student'}
                  messages={messages}
                  onSend={handleSendMessage}
                  readOnly={sessionEnded || lesson.status === 'COMPLETED'}
                />
              )}
              {sidebarTab === 'assignments' && <AssignmentsPanel lessonId={lessonId} />}
              {sidebarTab === 'agenda' && (
                <AgendaPanel
                  agenda={agenda}
                  onToggle={handleToggleAgenda}
                  onAdd={handleAddAgenda}
                  readOnly={sessionEnded || lesson.status === 'COMPLETED'}
                />
              )}
              {sidebarTab === 'notes' && (
                <NotesPanel
                  notes={notes}
                  onAdd={handleAddNote}
                  onToggle={handleToggleNote}
                />
              )}
            </div>

            {/* Sidebar footer: lesson details */}
            <div className="shrink-0 border-t border-[#1E3352] p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Lesson details</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Subject', value: lesson.topic || 'General' },
                  { label: 'Duration', value: lesson.durationMins ? `${lesson.durationMins} min` : '—' },
                  { label: 'Scheduled', value: formatTime(lesson.scheduledAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-300 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReview && (
        <ReviewModal
          lesson={lesson}
          user={user}
          onClose={() => setShowReview(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
