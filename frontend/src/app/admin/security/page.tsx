'use client';
import React, { useEffect, useState } from 'react';
import { getSessions, revokeSession, getFailedLogins, getSuspiciousActivity, getBlockedIps, blockIp, unblockIp } from '../../../services/adminApi';
import StatCard from '../../../components/admin/StatCard';

export default function SecurityPage() {
  const [tab, setTab] = useState('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<any>(null);
  const [suspicious, setSuspicious] = useState<any>(null);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockForm, setBlockForm] = useState({ ipAddress: '', reason: '' });
  const [blocking, setBlocking] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, fl, susp, ips] = await Promise.all([getSessions(), getFailedLogins(), getSuspiciousActivity(), getBlockedIps()]);
      setSessions(s as any[]);
      setFailedLogins(fl);
      setSuspicious(susp);
      setBlockedIps(ips as any[]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRevoke = async (id: string) => {
    try { await revokeSession(id); fetchAll(); } catch (e: any) { alert(e.message); }
  };

  const handleBlock = async () => {
    if (!blockForm.ipAddress || !blockForm.reason) return;
    setBlocking(true);
    try { await blockIp(blockForm); setBlockForm({ ipAddress: '', reason: '' }); fetchAll(); }
    catch (e: any) { alert(e.message); } finally { setBlocking(false); }
  };

  const handleUnblock = async (id: string) => {
    try { await unblockIp(id); fetchAll(); } catch (e: any) { alert(e.message); }
  };

  const tabs = ['sessions', 'failed-logins', 'suspicious', 'blocked-ips'];

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-gray-900">Security Center</h1><p className="text-gray-400 text-sm">Monitor sessions, threats, and access control</p></div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Active Sessions" value={sessions.length} icon="🔐" color="indigo" loading={loading} />
        <StatCard title="Failed Logins" value={(failedLogins as any)?.pagination?.total ?? 0} icon="⚠️" color="amber" loading={loading} />
        <StatCard title="Blocked IPs" value={blockedIps.length} icon="🚫" color="red" loading={loading} />
        <StatCard title="Suspicious IPs" value={(suspicious as any)?.topFailedIps?.length ?? 0} icon="🕵️" color="purple" loading={loading} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Sessions */}
      {tab === 'sessions' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Active Sessions</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['User', 'IP', 'Device', 'Last Active', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                : sessions.length ? sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium text-gray-800">{s.user?.firstName} {s.user?.lastName}</p><p className="text-xs text-gray-400">{s.user?.email}</p></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px]">{s.userAgent || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleString('en-IN') : '—'}</td>
                    <td className="px-4 py-3"><button onClick={() => handleRevoke(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Revoke</button></td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No active sessions</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed logins */}
      {tab === 'failed-logins' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Failed Login Attempts</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Email', 'IP', 'Reason', 'Timestamp'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {((failedLogins as any)?.items ?? []).map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{f.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{f.ipAddress}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{f.failureReason}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(f.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspicious */}
      {tab === 'suspicious' && suspicious && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top Failed IPs</h3>
            <div className="space-y-2">
              {(suspicious.topFailedIps ?? []).map((item: any) => (
                <div key={item.ip} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-mono text-sm text-gray-700">{item.ip}</span>
                  <span className="text-red-600 font-bold text-sm">{item.count} attempts</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Most Targeted Accounts</h3>
            <div className="space-y-2">
              {(suspicious.topTargetedEmails ?? []).map((item: any) => (
                <div key={item.email} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-gray-700 truncate">{item.email}</span>
                  <span className="text-amber-600 font-bold text-sm ml-2">{item.count}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blocked IPs */}
      {tab === 'blocked-ips' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Block New IP</h3>
            <div className="flex gap-3">
              <input value={blockForm.ipAddress} onChange={e => setBlockForm(p => ({ ...p, ipAddress: e.target.value }))} placeholder="IP address…" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300" />
              <input value={blockForm.reason} onChange={e => setBlockForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for blocking…" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300" />
              <button onClick={handleBlock} disabled={blocking} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {blocking ? '…' : 'Block'}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">{['IP', 'Reason', 'Blocked At', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {blockedIps.map((ip: any) => (
                  <tr key={ip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{ip.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-600">{ip.reason}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(ip.createdAt).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><button onClick={() => handleUnblock(ip.id)} className="text-cyan-600 hover:text-cyan-800 text-xs font-medium">Unblock</button></td>
                  </tr>
                ))}
                {!blockedIps.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No blocked IPs</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
