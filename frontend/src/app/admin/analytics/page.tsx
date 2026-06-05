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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Analytics</h1><p className="text-gray-400 text-sm">Revenue, booking, and customer reports</p></div>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600" />
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">Apply</button>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Revenue</h3>
        {loading ? <div className="h-32 skeleton" /> : <BarChart data={revenue?.byDay ?? []} label="Daily revenue for selected period" />}
      </div>

      {/* Bookings by status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Bookings by Status</h3>
        {loading ? <div className="h-20 skeleton" /> : (
          <div className="grid grid-cols-5 gap-3">
            {(bookings?.byStatus ?? []).map((s: any) => (
              <div key={s.status} className="text-center bg-gray-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{s.status.toLowerCase().replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Export Reports</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['revenue', 'bookings', 'customers', 'refunds'].map(type => (
            <div key={type} className="border border-gray-100 rounded-xl p-4">
              <p className="font-medium text-gray-700 capitalize mb-3">{type}</p>
              <div className="flex gap-2">
                {['csv', 'pdf'].map(format => (
                  <button key={format} onClick={() => handleExport(type, format)} disabled={exporting === `${type}-${format}`} className="flex-1 py-1.5 text-xs font-medium bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 rounded-lg transition-colors uppercase disabled:opacity-50">
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
