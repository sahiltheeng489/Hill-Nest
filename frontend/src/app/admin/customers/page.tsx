'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getCustomers, updateCustomerStatus, type Customer, type PaginatedResponse } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Link from 'next/link';

export default function CustomersPage() {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ customer: Customer; newStatus: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.q = search;
      if (status) params.status = status;
      setData(await getCustomers(params));
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await updateCustomerStatus(confirmAction.customer.id, { status: confirmAction.newStatus });
      setConfirmAction(null);
      fetchData();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'name', label: 'Customer', sortable: true, render: (r: Customer) => (
      <div>
        <p className="font-medium text-gray-800">{r.name || '—'}</p>
        <p className="text-xs text-gray-400">{r.email}</p>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (r: Customer) => r.phone || <span className="text-gray-300">—</span> },
    { key: 'totalBookings', label: 'Bookings', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (r: Customer) => `₹${Number(r.totalSpent).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: (r: Customer) => <StatusBadge value={r.status} /> },
    { key: 'createdAt', label: 'Joined', sortable: true, render: (r: Customer) => new Date(r.createdAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: '', render: (r: Customer) => (
      <div className="flex items-center gap-2">
        <Link href={`/admin/customers/${r.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">View →</Link>
        {r.status === 'ACTIVE'
          ? <button onClick={e => { e.stopPropagation(); setConfirmAction({ customer: r, newStatus: 'SUSPENDED' }); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Suspend</button>
          : <button onClick={e => { e.stopPropagation(); setConfirmAction({ customer: r, newStatus: 'ACTIVE' }); }} className="text-cyan-600 hover:text-cyan-800 text-xs font-medium">Activate</button>
        }
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-gray-900">Customers</h1><p className="text-gray-400 text-sm">Manage customer accounts</p></div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-600">
          {['', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_VERIFICATION'].map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!confirmAction}
        title={`${confirmAction?.newStatus === 'ACTIVE' ? 'Reactivate' : 'Suspend'} Customer`}
        message={`Are you sure you want to ${confirmAction?.newStatus === 'ACTIVE' ? 'reactivate' : 'suspend'} ${confirmAction?.customer.name}?`}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
        variant={confirmAction?.newStatus === 'ACTIVE' ? 'default' : 'danger'}
        confirmLabel={confirmAction?.newStatus === 'ACTIVE' ? 'Reactivate' : 'Suspend'}
      />
    </div>
  );
}
