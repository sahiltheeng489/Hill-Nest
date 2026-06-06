'use client';
import React, { useEffect, useState } from 'react';
import { getAnalyticsRevenue, getAnalyticsBookings, exportAnalytics } from '../../../services/adminApi';
import StatCard from '../../../components/admin/StatCard';

function BarChart({ data, label }: { data: { date: string; revenue: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-32">
        {data.slice(-30).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ₹${Number(d.revenue).toLocaleString('en-IN')}`}>
            <div className="w-full rounded-sm bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer" style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? '2px' : '0' }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [bookings, setBookings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const [rev, book] = await Promise.all([getAnalyticsRevenue(params), getAnalyticsBookings(params)]);
      setRevenue(rev);
      setBookings(book);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (type: string, format: string) => {
    setExporting(`${type}-${format}`);
    try {
      await exportAnalytics({ type, format, ...(from ? { from } : {}), ...(to ? { to } : {}) });
    } catch (e: any) { alert(e.message); }
    finally { setExporting(''); }
  };

  return (
    <div className="space-y-5 text-white">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Analytics</h1><p className="text-sm text-white/45">Revenue, booking, and customer reports</p></div>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-md" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white backdrop-blur-md" />
          <button onClick={fetchData} className="rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white">Apply</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={revenue?.total ?? 0} icon="💰" color="green" suffix="₹" loading={loading} />
        <StatCard title="Avg per Booking" value={revenue?.average ?? 0} icon="📊" color="blue" suffix="₹" loading={loading} />
        <StatCard title="Total Bookings" value={bookings?.total ?? 0} icon="📅" color="indigo" loading={loading} />
        <StatCard title="Successful Payments" value={revenue?.count ?? 0} icon="✅" color="green" loading={loading} />
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <h3 className="mb-4 font-semibold text-white">Daily Revenue</h3>
        {loading ? <div className="h-32 skeleton" /> : <BarChart data={revenue?.byDay ?? []} label="Daily revenue for selected period" />}
      </div>

      {/* Bookings by status */}
      <div className="rounded-xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <h3 className="mb-4 font-semibold text-white">Bookings by Status</h3>
        {loading ? <div className="h-20 skeleton" /> : (
          <div className="grid grid-cols-5 gap-3">
            {(bookings?.byStatus ?? []).map((s: any) => (
              <div key={s.status} className="rounded-xl border border-white/8 bg-white/8 p-4 text-center backdrop-blur-md">
                <p className="text-2xl font-bold text-white">{s.count}</p>
                <p className="mt-1 text-xs capitalize text-white/40">{s.status.toLowerCase().replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="rounded-xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
        <h3 className="mb-4 font-semibold text-white">Export Reports</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['revenue', 'bookings', 'customers', 'refunds'].map(type => (
            <div key={type} className="rounded-xl border border-white/8 bg-white/8 p-4 backdrop-blur-md">
              <p className="mb-3 font-medium capitalize text-white/75">{type}</p>
              <div className="flex gap-2">
                {['csv', 'pdf'].map(format => (
                  <button key={format} onClick={() => handleExport(type, format)} disabled={exporting === `${type}-${format}`} className="flex-1 rounded-lg border border-white/10 bg-white/8 py-1.5 text-xs font-medium uppercase text-white/70 transition-colors hover:bg-white/12 disabled:opacity-50">
                    {exporting === `${type}-${format}` ? '…' : format}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
