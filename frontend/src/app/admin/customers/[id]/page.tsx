'use client';
import React, { useEffect, useState } from 'react';
import { getCustomerById, updateCustomerStatus } from '../../../../services/adminApi';
import StatusBadge from '../../../../components/admin/StatusBadge';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import Link from 'next/link';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getCustomerById(params.id).then(setData).finally(() => setLoading(false));
  }, [params.id]);

  const handleStatusChange = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      const newStatus = data.customer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await updateCustomerStatus(params.id, { status: newStatus });
      setData((prev: any) => ({ ...prev, customer: { ...prev.customer, status: newStatus } }));
      setConfirmSuspend(false);
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="space-y-4"><div className="h-32 skeleton rounded-xl" /><div className="h-64 skeleton rounded-xl" /></div>;
  if (!data) return <div className="text-center py-16 text-white/45">Customer not found</div>;

  const { customer, recentBookings, tickets } = data;

  return (
    <div className="max-w-5xl space-y-5 text-white">
      <div className="flex items-center gap-2 text-sm text-white/45">
        <Link href="/admin/customers" className="transition-colors hover:text-white">Customers</Link>
        <span>/</span>
        <span className="text-white/75">{customer.name || customer.email}</span>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#163E3C] to-[#6F9487] text-xl font-bold text-white">
              {(customer.name || customer.email)[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{customer.name || '—'}</h1>
              <p className="text-white/55">{customer.email}</p>
              {customer.phone && <p className="text-sm text-white/40">{customer.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge value={customer.status} />
            <button
              onClick={() => setConfirmSuspend(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${customer.status === 'ACTIVE' ? 'border border-red-300/20 bg-red-500/10 text-red-100 hover:bg-red-500/15' : 'border border-white/10 bg-white/8 text-white hover:bg-white/12'}`}
            >
              {customer.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {[['Total Bookings', customer.totalBookings], ['Total Spent', `₹${Number(customer.totalSpent).toLocaleString('en-IN')}`], ['Joined', new Date(customer.createdAt).toLocaleDateString('en-IN')]].map(([k, v]) => (
            <div key={String(k)} className="text-center">
              <p className="text-2xl font-bold text-white">{v}</p>
              <p className="mt-1 text-xs text-white/40">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-white/10 bg-white/8 p-1 backdrop-blur-md">
        {['bookings', 'tickets'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white/12 text-white shadow-sm' : 'text-white/55 hover:text-white'}`}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'bookings' && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
          <table className="w-full text-sm">
            <thead><tr className="bg-white/6">{['Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/40">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-white/8">
              {recentBookings.length ? recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-white/8">
                  <td className="px-4 py-3 font-medium text-white">{b.roomName}</td>
                  <td className="px-4 py-3 text-white/65">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-white/65">{new Date(b.checkOut).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-medium text-white">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge value={b.status} /></td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-white/45">No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
          <table className="w-full text-sm">
            <thead><tr className="bg-white/6">{['Subject', 'Status', 'Priority', 'Created'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-white/40">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-white/8">
              {tickets.length ? tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-white/8">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-white">{t.subject}</td>
                  <td className="px-4 py-3"><StatusBadge value={t.status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={t.priority} /></td>
                  <td className="px-4 py-3 text-white/45">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-white/45">No tickets found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmSuspend}
        title={customer.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
        message={`Are you sure? This will ${customer.status === 'ACTIVE' ? 'prevent' : 'allow'} this customer from using the platform.`}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmSuspend(false)}
        loading={actionLoading}
        variant={customer.status === 'ACTIVE' ? 'danger' : 'default'}
        confirmLabel={customer.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
      />
    </div>
  );
}
