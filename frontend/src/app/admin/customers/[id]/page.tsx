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
  if (!data) return <div className="text-center py-16 text-gray-400">Customer not found</div>;

  const { customer, recentBookings, tickets } = data;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin/customers" className="hover:text-indigo-600 transition-colors">Customers</Link>
        <span>/</span>
        <span className="text-gray-700">{customer.name || customer.email}</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
              {(customer.name || customer.email)[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{customer.name || '—'}</h1>
              <p className="text-gray-500">{customer.email}</p>
              {customer.phone && <p className="text-gray-400 text-sm">{customer.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge value={customer.status} />
            <button
              onClick={() => setConfirmSuspend(true)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${customer.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
            >
              {customer.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[['Total Bookings', customer.totalBookings], ['Total Spent', `₹${Number(customer.totalSpent).toLocaleString('en-IN')}`], ['Joined', new Date(customer.createdAt).toLocaleDateString('en-IN')]].map(([k, v]) => (
            <div key={String(k)} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{v}</p>
              <p className="text-xs text-gray-400 mt-1">{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {['bookings', 'tickets'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Room', 'Check-in', 'Check-out', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.length ? recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.roomName}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.checkOut).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge value={b.status} /></td>
                </tr>
              )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No bookings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Subject', 'Status', 'Priority', 'Created'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.length ? tickets.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{t.subject}</td>
                  <td className="px-4 py-3"><StatusBadge value={t.status} /></td>
                  <td className="px-4 py-3"><StatusBadge value={t.priority} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">No tickets found</td></tr>}
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
