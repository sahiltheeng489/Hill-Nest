'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getBookings, updateBookingStatus, cancelBooking, type Booking, type PaginatedResponse } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export default function BookingsPage() {
  const [data, setData] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.q = search;
      if (status) params.status = status;
      setData(await getBookings(params));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async () => {
    if (!selected || !newStatus) return;
    setActionLoading(true);
    try {
      await updateBookingStatus(selected.id, { status: newStatus });
      setSelected(null);
      setNewStatus('');
      fetchData();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!selected || cancelReason.length < 10) return;
    setActionLoading(true);
    try {
      await cancelBooking(selected.id, { reason: cancelReason });
      setShowCancel(false);
      setSelected(null);
      setCancelReason('');
      fetchData();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const columns = [
    { key: 'id', label: 'Booking ID', render: (r: Booking) => <span className="font-mono text-xs text-gray-500">{r.id.slice(-8).toUpperCase()}</span> },
    { key: 'customer', label: 'Customer', render: (r: Booking) => <div><p className="font-medium text-gray-800">{r.customer?.name}</p><p className="text-xs text-gray-400">{r.customer?.email}</p></div> },
    { key: 'roomName', label: 'Room', sortable: true },
    { key: 'checkIn', label: 'Check-in', render: (r: Booking) => new Date(r.checkIn).toLocaleDateString('en-IN'), sortable: true },
    { key: 'checkOut', label: 'Check-out', render: (r: Booking) => new Date(r.checkOut).toLocaleDateString('en-IN') },
    { key: 'guests', label: 'Guests' },
    { key: 'totalAmount', label: 'Amount', render: (r: Booking) => `₹${Number(r.totalAmount).toLocaleString('en-IN')}`, sortable: true },
    { key: 'status', label: 'Status', render: (r: Booking) => <StatusBadge value={r.status} /> },
    { key: 'actions', label: '', render: (r: Booking) => (
      <button onClick={e => { e.stopPropagation(); setSelected(r); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Details →</button>
    )},
  ];

  return (
    <div className="space-y-5 text-white">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Bookings</h1><p className="text-sm text-white/45">Manage all property bookings</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-white/8 p-4 backdrop-blur-2xl">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by customer or room…" className="w-full rounded-lg border border-white/10 bg-white/8 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 focus:border-[#6F9487]/50 backdrop-blur-md" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {error && <div className="rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} onRowClick={r => setSelected(r as Booking)} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(4,21,26,0.62)' }} onClick={() => setSelected(null)}>
          <div className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.96),rgba(9,40,40,0.9))] shadow-xl backdrop-blur-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Booking Details</h2>
                <button onClick={() => setSelected(null)} className="text-white/45 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['ID', selected.id.slice(-8).toUpperCase()],
                    ['Customer', selected.customer?.name],
                    ['Email', selected.customer?.email],
                    ['Room', selected.roomName],
                    ['Room Type', selected.roomType],
                    ['Check-in', new Date(selected.checkIn).toLocaleDateString('en-IN')],
                    ['Check-out', new Date(selected.checkOut).toLocaleDateString('en-IN')],
                    ['Nights', selected.nights],
                    ['Guests', selected.guests],
                    ['Price/Night', `₹${Number(selected.pricePerNight).toLocaleString('en-IN')}`],
                    ['Total', `₹${Number(selected.totalAmount).toLocaleString('en-IN')}`],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="rounded-lg border border-white/8 bg-white/8 p-3 backdrop-blur-md">
                      <p className="text-xs text-white/40">{k}</p>
                      <p className="mt-0.5 truncate font-medium text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-white/8 bg-white/8 p-3 backdrop-blur-md">
                  <p className="mb-1 text-xs text-white/40">Current Status</p>
                  <StatusBadge value={selected.status} />
                </div>

                {selected.cancelReason && (
                  <div className="rounded-lg border border-red-300/20 bg-red-500/10 p-3">
                    <p className="text-xs text-red-100/70">Cancellation Reason</p>
                    <p className="mt-1 text-sm text-red-50">{selected.cancelReason}</p>
                  </div>
                )}

                {/* Status Update */}
                {selected.status !== 'CANCELLED' && selected.status !== 'REFUNDED' && (
                  <div className="space-y-2 border-t border-white/10 pt-2">
                    <p className="font-medium text-white/75">Update Status</p>
                    <div className="flex gap-2">
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md">
                        <option value="">Select status…</option>
                        {STATUSES.filter(s => s && s !== selected.status).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={handleStatusUpdate} disabled={!newStatus || actionLoading} className="rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                        Update
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel */}
                {!['CANCELLED', 'COMPLETED', 'REFUNDED'].includes(selected.status) && (
                  <button onClick={() => setShowCancel(true)} className="mt-2 w-full rounded-lg border border-red-300/20 bg-red-500/10 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/15">
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showCancel}
        title="Cancel Booking"
        message="Please provide a reason for cancellation."
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
        loading={actionLoading}
        variant="danger"
        confirmLabel="Cancel Booking"
      >
        <textarea
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          placeholder="Reason for cancellation (minimum 10 characters)…"
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
        />
        {cancelReason.length > 0 && cancelReason.length < 10 && (
          <p className="text-red-500 text-xs mt-1">{10 - cancelReason.length} more characters required</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
