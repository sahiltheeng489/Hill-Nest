'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getRefunds, approveRefund, rejectRefund, getRefundStats, type Refund } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import StatCard from '../../../components/admin/StatCard';

export default function RefundsPage() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [approveTarget, setApproveTarget] = useState<Refund | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Refund | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (status) params.status = status;
      const [refunds, statsData] = await Promise.all([getRefunds(params), getRefundStats()]);
      setData(refunds);
      setStats(statsData as any[]);
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try { await approveRefund(approveTarget.id, { adminNotes }); setApproveTarget(null); setAdminNotes(''); fetchData(); }
    catch (e: any) { alert(e.message); } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectTarget || adminNotes.length < 10) return;
    setActionLoading(true);
    try { await rejectRefund(rejectTarget.id, { adminNotes }); setRejectTarget(null); setAdminNotes(''); fetchData(); }
    catch (e: any) { alert(e.message); } finally { setActionLoading(false); }
  };

  const pending = stats.find((s: any) => s.status === 'PENDING')?._count?._all ?? 0;
  const approved = stats.find((s: any) => s.status === 'APPROVED')?._sum?.amount ?? 0;

  const columns = [
    { key: 'booking', label: 'Booking', render: (r: Refund) => <div><p className="font-medium text-gray-800">{r.booking?.roomName}</p><p className="text-xs text-gray-400">{r.booking?.customer?.name}</p></div> },
    { key: 'type', label: 'Type', render: (r: Refund) => <span className="capitalize text-gray-600">{r.type}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (r: Refund) => <span className="font-semibold text-gray-800">₹{Number(r.amount).toLocaleString('en-IN')}</span> },
    { key: 'reason', label: 'Reason', render: (r: Refund) => <span className="text-gray-600 truncate max-w-[200px] block">{r.reason}</span> },
    { key: 'status', label: 'Status', render: (r: Refund) => <StatusBadge value={r.status} /> },
    { key: 'createdAt', label: 'Requested', render: (r: Refund) => new Date(r.createdAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: '', render: (r: Refund) => r.status === 'PENDING' ? (
      <div className="flex gap-2">
        <button onClick={e => { e.stopPropagation(); setApproveTarget(r); setAdminNotes(''); }} className="text-cyan-600 hover:text-cyan-800 text-xs font-medium">Approve</button>
        <button onClick={e => { e.stopPropagation(); setRejectTarget(r); setAdminNotes(''); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Reject</button>
      </div>
    ) : null },
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-gray-900">Refunds</h1><p className="text-gray-400 text-sm">Manage refund approval workflow</p></div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Pending Approval" value={pending} icon="⏳" color="amber" loading={loading} />
        <StatCard title="Approved Amount" value={Number(approved)} icon="✅" color="green" suffix="₹" loading={loading} />
        <StatCard title="Total Refunds" value={data?.pagination?.total ?? 0} icon="↩️" color="indigo" loading={loading} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none text-gray-600">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'].map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      <ConfirmDialog open={!!approveTarget} title="Approve Refund" message={`Approve ₹${Number(approveTarget?.amount ?? 0).toLocaleString('en-IN')} refund for ${approveTarget?.booking?.customer?.name}?`}
        onConfirm={handleApprove} onCancel={() => setApproveTarget(null)} loading={actionLoading} confirmLabel="Approve Refund">
        <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Admin notes (optional)…" rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
      </ConfirmDialog>

      <ConfirmDialog open={!!rejectTarget} title="Reject Refund" message="Please provide a reason for rejection." variant="danger"
        onConfirm={handleReject} onCancel={() => setRejectTarget(null)} loading={actionLoading} confirmLabel="Reject Refund">
        <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Rejection reason (minimum 10 characters)…" rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300" />
        {adminNotes.length > 0 && adminNotes.length < 10 && <p className="text-red-500 text-xs mt-1">{10 - adminNotes.length} more characters needed</p>}
      </ConfirmDialog>
    </div>
  );
}
