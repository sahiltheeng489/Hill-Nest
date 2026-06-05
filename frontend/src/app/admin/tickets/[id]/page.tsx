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
  if (!ticket) return <div className="text-center py-16 text-gray-400">Ticket not found</div>;

  const STATUS_ACTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].filter(s => s !== ticket.status);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin/tickets" className="hover:text-indigo-600">Tickets</Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs">{ticket.subject}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-gray-500 text-sm mt-1">From: {ticket.customer?.name} ({ticket.customer?.email})</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge value={ticket.priority} />
            <StatusBadge value={ticket.status} />
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</div>

        {/* Status actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {STATUS_ACTIONS.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors capitalize">
              Mark {s.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Notes ({ticket.notes?.length ?? 0})</h2>
        </div>
        <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
          {ticket.notes?.length ? ticket.notes.map((note: any) => (
            <div key={note.id} className={`rounded-xl p-4 ${note.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  {note.isInternal ? '🔒 Internal Note' : '📨 Customer Reply'}
                </span>
                <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          )) : <p className="text-center text-gray-400 text-sm py-8">No notes yet</p>}
        </div>

        {/* Add note */}
        <div className="p-5 border-t border-gray-100 space-y-3">
          <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Add a note…" rows={3} className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-none" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded" />
              Internal note (not visible to customer)
            </label>
            <button onClick={handleAddNote} disabled={!noteContent.trim() || submittingNote} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {submittingNote && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
