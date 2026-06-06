'use client';
import React, { useEffect, useState } from 'react';
import { getNotifications, getNotificationStats, sendNotification } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';

const CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'IN_APP'];

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState({ channel: 'EMAIL', subject: '', body: '', recipientRef: '' });
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifs, statsData] = await Promise.all([getNotifications({ page: String(page), limit: '15' }), getNotificationStats()]);
      setData(notifs);
      setStats(statsData);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleSend = async () => {
    if (!form.body || !form.recipientRef) return;
    setSending(true);
    try { await sendNotification(form); setShowSend(false); setForm({ channel: 'EMAIL', subject: '', body: '', recipientRef: '' }); fetchData(); }
    catch (e: any) { alert(e.message); } finally { setSending(false); }
  };

  const columns = [
    { key: 'channel', label: 'Channel', render: (r: any) => <StatusBadge value={r.channel} /> },
    { key: 'recipient', label: 'Recipient', render: (r: any) => <span className="text-gray-600">{r.recipientRef}</span> },
    { key: 'subject', label: 'Subject', render: (r: any) => <span className="text-gray-700 truncate max-w-[200px] block">{r.subject || '—'}</span> },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge value={r.status} /> },
    { key: 'sentAt', label: 'Sent', render: (r: any) => r.sentAt ? new Date(r.sentAt).toLocaleDateString('en-IN') : '—' },
  ];

  return (
    <div className="space-y-5 text-white">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Notifications</h1><p className="text-sm text-white/45">Manage and send notifications to customers</p></div>
        <button onClick={() => setShowSend(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          Send Notification
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {CHANNELS.map(ch => {
            const count = (stats.byChannel ?? []).find((s: any) => s.channel === ch)?._count?._all ?? 0;
            return <div key={ch} className="rounded-xl border border-white/10 bg-white/8 p-4 text-center backdrop-blur-2xl"><p className="text-2xl font-bold text-white">{count}</p><p className="mt-1 text-xs text-white/40">{ch}</p></div>;
          })}
        </div>
      )}

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {/* Send modal */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(4,21,26,0.68)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.94),rgba(9,40,40,0.82))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
            <h2 className="text-lg font-bold text-white">Send Notification</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/75">Channel</label>
                <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-md">
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/75">Recipient</label>
                <input value={form.recipientRef} onChange={e => setForm(p => ({ ...p, recipientRef: e.target.value }))} placeholder="Email / Phone / Token" className="w-full rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 backdrop-blur-md" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/75">Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Notification subject…" className="w-full rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 backdrop-blur-md" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/75">Message Body</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="Notification content…" className="w-full resize-none rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowSend(false)} className="rounded-lg border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-white/75 hover:bg-white/12">Cancel</button>
              <button onClick={handleSend} disabled={sending || !form.body || !form.recipientRef} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                {sending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
