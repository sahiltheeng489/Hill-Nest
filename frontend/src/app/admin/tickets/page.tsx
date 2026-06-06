'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getTickets, updateTicketStatus, type Ticket } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';
import Link from 'next/link';

export default function TicketsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (search) params.q = search;
      setData(await getTickets(params));
    } finally { setLoading(false); }
  }, [page, status, priority, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'subject', label: 'Subject', render: (r: Ticket) => (
      <div>
        <Link href={`/admin/tickets/${r.id}`} className="font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate max-w-[250px] block">{r.subject}</Link>
        <p className="text-xs text-gray-400">{r.customer?.name} · {r.customer?.email}</p>
      </div>
    )},
    { key: 'category', label: 'Category', render: (r: Ticket) => <span className="capitalize text-gray-600">{r.category}</span> },
    { key: 'priority', label: 'Priority', render: (r: Ticket) => <StatusBadge value={r.priority} /> },
    { key: 'status', label: 'Status', render: (r: Ticket) => <StatusBadge value={r.status} /> },
    { key: '_count', label: 'Notes', render: (r: Ticket) => <span className="text-gray-500">{r._count?.notes ?? 0}</span> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (r: Ticket) => new Date(r.createdAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: '', render: (r: Ticket) => (
      <div className="flex gap-2">
        <Link href={`/admin/tickets/${r.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View →</Link>
        {r.status === 'OPEN' && (
          <button onClick={async e => { e.stopPropagation(); await updateTicketStatus(r.id, { status: 'IN_PROGRESS' }); fetchData(); }} className="text-amber-600 hover:text-amber-800 text-xs font-medium">Take →</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-5 text-white">
      <div><h1 className="text-xl font-bold text-white">Support Tickets</h1><p className="text-sm text-white/45">Manage customer support tickets</p></div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/8 p-4 backdrop-blur-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tickets…" className="w-full rounded-lg border border-white/10 bg-white/8 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-md">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-md">
          {['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(s => <option key={s} value={s}>{s || 'All Priorities'}</option>)}
        </select>
      </div>

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  );
}
