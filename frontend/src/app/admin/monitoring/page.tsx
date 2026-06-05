'use client';
import React, { useEffect, useState } from 'react';
import { getHealthStatus, getSystemMetrics } from '../../../services/adminApi';

function HealthDot({ status }: { status: string }) {
  const colors: Record<string, string> = { healthy: 'bg-green-400', degraded: 'bg-amber-400', down: 'bg-red-500' };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] ?? 'bg-gray-300'}`} />;
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, m] = await Promise.all([getHealthStatus(), getSystemMetrics()]);
      setHealth(h);
      setMetrics(m);
      setLastRefreshed(new Date());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); const id = setInterval(fetchAll, 30000); return () => clearInterval(id); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-400 text-sm">Real-time health and performance metrics {lastRefreshed ? `· Last refreshed ${lastRefreshed.toLocaleTimeString('en-IN')}` : ''}</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Health Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Service Health</h2>
          {health && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${health.overall === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              <HealthDot status={health.overall} />
              {health.overall === 'healthy' ? 'All Systems Operational' : 'Degraded Performance'}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(health?.services ?? {}).map(([name, info]: [string, any]) => (
            <div key={name} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-700 capitalize">{name}</p>
                <HealthDot status={info.status} />
              </div>
              <p className={`text-sm font-semibold ${info.status === 'healthy' ? 'text-green-600' : 'text-red-500'}`}>{info.status}</p>
              {info.latency !== undefined && <p className="text-xs text-gray-400 mt-1">{info.latency}ms latency</p>}
              {info.message && <p className="text-xs text-red-400 mt-1">{info.message}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Runtime Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Runtime</h2>
            <div className="space-y-3">
              {[
                ['Active Sessions', metrics.runtime?.activeSessions],
                ['Memory Used', `${metrics.runtime?.memoryUsed} MB / ${metrics.runtime?.memoryTotal} MB`],
                ['Uptime', `${Math.floor((metrics.runtime?.uptime ?? 0) / 60)}m ${(metrics.runtime?.uptime ?? 0) % 60}s`],
                ['Node.js', metrics.runtime?.nodeVersion],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-semibold text-gray-800">{v}</span>
                </div>
              ))}
              {/* Memory bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Memory</span>
                  <span>{metrics.runtime?.memoryUsed}/{metrics.runtime?.memoryTotal} MB</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((metrics.runtime?.memoryUsed ?? 0) / (metrics.runtime?.memoryTotal ?? 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Database Records</h2>
            <div className="space-y-2">
              {Object.entries(metrics.database ?? {}).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500 capitalize">{k}</span>
                  <span className="text-sm font-bold text-gray-800">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
