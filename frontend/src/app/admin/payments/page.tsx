'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getPayments, getPaymentStats, type Payment } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';
import StatCard from '../../../components/admin/StatCard';

const STATUSES = ['', 'CREATED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'];

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (status) params.status = status;
      if (search) params.q = search;
      const [payments, statsData] = await Promise.all([getPayments(params), getPaymentStats()]);
      setData(payments);
      setStats(statsData as any);
    } finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { key: 'razorpayPaymentId', label: 'Transaction ID', render: (r: Payment) => <span className="font-mono text-xs text-gray-500">{r.razorpayPaymentId || r.id.slice(-12).toUpperCase()}</span> },
    { key: 'customer', label: 'Customer', render: (r: Payment) => <div><p className="font-medium text-gray-800">{r.customer?.name}</p><p className="text-xs text-gray-400">{r.customer?.email}</p></div> },
    { key: 'booking', label: 'Room', render: (r: Payment) => <span className="text-gray-600">{r.booking?.roomName}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (r: Payment) => <span className="font-semibold text-gray-800">₹{Number(r.amount).toLocaleString('en-IN')}</span> },
    { key: 'gateway', label: 'Gateway', render: (r: Payment) => <span className="capitalize text-gray-600">{r.gateway}</span> },
    { key: 'status', label: 'Status', render: (r: Payment) => <StatusBadge value={r.status} /> },
    { key: 'paidAt', label: 'Date', render: (r: Payment) => r.paidAt ? new Date(r.paidAt).toLocaleDateString('en-IN') : new Date(r.createdAt).toLocaleDateString('en-IN') },
  ];

  const totalRevenue = (stats as any)?.byStatus?.find((s: any) => s.status === 'PAID')?._sum?.amount ?? 0;
  const totalFailed = (stats as any)?.byStatus?.find((s: any) => s.status === 'FAILED')?._count?._all ?? 0;

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-gray-900">Payments</h1><p className="text-gray-400 text-sm">Monitor all payment transactions</p></div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={totalRevenue} icon="💰" color="green" suffix="₹" loading={loading} />
        <StatCard title="Failed Payments" value={totalFailed} icon="⚠️" color="red" loading={loading} />
        <StatCard title="Total Transactions" value={data?.pagination?.total ?? 0} icon="💳" color="blue" loading={loading} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by transaction ID…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-600">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}
    </div>
  );
}
