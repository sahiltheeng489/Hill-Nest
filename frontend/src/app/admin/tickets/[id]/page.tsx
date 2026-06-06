'use client';
import React, { useEffect, useState } from 'react';
import { getTicketById, addTicketNote, updateTicketStatus } from '../../../../services/adminApi';
import StatusBadge from '../../../../components/admin/StatusBadge';
import Link from 'next/link';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchTicket = async () => { setLoading(true); const t = await getTicketById(params.id); setTicket(t); setLoading(false); };
  useEffect(() => { fetchTicket(); }, [params.id]);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    try { await addTicketNote(params.id, { content: noteContent, isInternal }); setNoteContent(''); fetchTicket(); }
    catch (e: any) { alert(e.message); } finally { setSubmittingNote(false); }
  };

  const handleStatusChange = async (status: string) => {
    try { await updateTicketStatus(params.id, { status }); fetchTicket(); }
    catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="space-y-4"><div className="h-32 skeleton rounded-xl" /><div className="h-64 skeleton rounded-xl" /></div>;
  if (!ticket) return <div className="text-center py-16 text-white/45">Ticket not found</div>;

  const STATUS_ACTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].filter(s => s !== ticket.status);

  return (
    <div className="max-w-4xl space-y-5 text-white">
      <div className="flex items-center gap-2 text-sm text-white/45">
        <Link href="/admin/tickets" className="hover:text-white">Tickets</Link>
        <span>/</span>
        <span className="max-w-xs truncate text-white/75">{ticket.subject}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-white/55">From: {ticket.customer?.name} ({ticket.customer?.email})</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge value={ticket.priority} />
            <StatusBadge value={ticket.status} />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/8 bg-white/8 p-4 text-sm text-white/80 whitespace-pre-wrap backdrop-blur-md">{ticket.description}</div>

        {/* Status actions */}
        <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
          {STATUS_ACTIONS.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} className="rounded-lg border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium capitalize text-white/70 transition-colors hover:bg-white/12">
              Mark {s.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">Notes ({ticket.notes?.length ?? 0})</h2>
        </div>
        <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
          {ticket.notes?.length ? ticket.notes.map((note: any) => (
            <div key={note.id} className={`rounded-xl border p-4 ${note.isInternal ? 'border-amber-300/20 bg-amber-500/10' : 'border-white/8 bg-white/8'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/55">
                  {note.isInternal ? '🔒 Internal Note' : '📨 Customer Reply'}
                </span>
                <span className="text-xs text-white/40">{new Date(note.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-white/80 whitespace-pre-wrap">{note.content}</p>
            </div>
          )) : <p className="py-8 text-center text-sm text-white/45">No notes yet</p>}
        </div>

        {/* Add note */}
        <div className="space-y-3 border-t border-white/10 p-5">
          <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Add a note…" rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 focus:border-[#6F9487]/50 backdrop-blur-md" />
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/65">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded border-white/10 bg-white/8" />
              Internal note (not visible to customer)
            </label>
            <button onClick={handleAddNote} disabled={!noteContent.trim() || submittingNote} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {submittingNote && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
