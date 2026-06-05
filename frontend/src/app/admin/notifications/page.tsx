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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Notifications</h1><p className="text-gray-400 text-sm">Manage and send notifications to customers</p></div>
        <button onClick={() => setShowSend(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          Send Notification
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {CHANNELS.map(ch => {
            const count = (stats.byChannel ?? []).find((s: any) => s.channel === ch)?._count?._all ?? 0;
            return <div key={ch} className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{count}</p><p className="text-xs text-gray-400 mt-1">{ch}</p></div>;
          })}
        </div>
      )}

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {/* Send modal */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Send Notification</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <input value={form.recipientRef} onChange={e => setForm(p => ({ ...p, recipientRef: e.target.value }))} placeholder="Email / Phone / Token" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Notification subject…" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="Notification content…" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowSend(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSend} disabled={sending || !form.body || !form.recipientRef} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
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
