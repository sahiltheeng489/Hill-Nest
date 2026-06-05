'use client';
import React, { useEffect, useState } from 'react';
import { getStats, type DashboardStats } from '../../services/adminApi';
import { useAdminStore } from '../../store/adminStore';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';

function SimpleLineChart({ data }: { data: { date: string; value: number }[] }) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-gray-300 text-sm">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => ({ x: (i / (data.length - 1)) * 100, y: 100 - (d.value / max) * 80 }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  let cumPct = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
        <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="3.8" />
        {data.map((d, i) => {
          const pct = total ? (d.count / total) * 100 : 0;
          const offset = cumPct;
          cumPct += pct;
          return (
            <circle key={d.status} cx="18" cy="18" r="15.9155" fill="transparent"
              stroke={colors[i % colors.length]} strokeWidth="3.8"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={100 - offset}
            />
          );
        })}
        <text x="18" y="20" textAnchor="middle" className="rotate-90" style={{ fontSize: '8px', fill: '#111', fontWeight: 700 }}>{total}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={d.status} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="capitalize">{d.status.toLowerCase().replace('_', ' ')}</span>
            <span className="ml-auto font-semibold text-gray-800">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { state } = useAdminStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const user = state.adminUser;
  const firstName = user?.firstName ?? 'Admin';

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-600 font-medium">Failed to load dashboard</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  const ov = stats?.overview;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName} 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">{today}</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={ov?.totalBookings ?? 0} change={ov?.bookingChange} icon="📅" color="indigo" loading={loading} />
        <StatCard title="Total Revenue" value={ov?.totalRevenue ?? 0} change={ov?.revenueChange} icon="💰" color="green" suffix="₹" loading={loading} />
        <StatCard title="Total Customers" value={ov?.totalCustomers ?? 0} icon="👥" color="blue" loading={loading} />
        <StatCard title="Failed Payments" value={ov?.failedPayments ?? 0} icon="⚠️" color="red" loading={loading} />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Pending Refunds" value={ov?.pendingRefunds ?? 0} icon="↩️" color="amber" loading={loading} />
        <StatCard title="Open Tickets" value={ov?.openTickets ?? 0} icon="🎫" color="purple" loading={loading} />
        <StatCard title="New Customers" value={ov?.newCustomersThisMonth ?? 0} icon="🌱" color="green" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Revenue chart */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue (Last 30 Days)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily earnings in ₹</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">₹{(ov?.revenueThisMonth ?? 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">This month</p>
            </div>
          </div>
          {loading ? <div className="h-24 skeleton" /> : <SimpleLineChart data={stats?.charts.revenueByDay ?? []} />}
        </div>

        {/* Bookings by status donut */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Bookings by Status</h3>
          {loading ? <div className="h-24 skeleton" /> : (
            stats?.charts.bookingsByStatus?.length
              ? <DonutChart data={stats.charts.bookingsByStatus} />
              : <div className="text-center text-gray-300 text-sm py-8">No booking data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-11 gap-4">
        {/* Recent Bookings */}
        <div className="col-span-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
            <a href="/admin/bookings" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Room</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 skeleton" /></td></tr>
                )) : (stats?.recentBookings ?? []).slice(0, 8).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/bookings'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[120px]">{b.customer?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">{b.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">{b.roomName}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><StatusBadge value={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !stats?.recentBookings?.length && (
              <div className="text-center py-8 text-gray-400 text-sm">No recent bookings</div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-80">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            )) : (stats?.recentActivity ?? []).map(a => (
              <div key={a.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                  {a.adminUser ? `${a.adminUser.firstName[0]}${a.adminUser.lastName[0]}` : '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 truncate">{a.description}</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
