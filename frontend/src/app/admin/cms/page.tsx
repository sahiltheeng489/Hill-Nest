'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { getCmsPages, publishCmsPage, archiveCmsPage, createCmsPage, type CmsPage } from '../../../services/adminApi';
import DataTable from '../../../components/admin/DataTable';
import Pagination from '../../../components/admin/Pagination';
import StatusBadge from '../../../components/admin/StatusBadge';

export default function CmsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ slug: '', title: '', type: 'PAGE', status: 'DRAFT', content: '', excerpt: '' });
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setData(await getCmsPages({ page: String(page), limit: '15' })); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try { await publishCmsPage(id); fetchData(); } catch (e: any) { alert(e.message); } finally { setActionLoading(null); }
  };

  const handleArchive = async (id: string) => {
    setActionLoading(id);
    try { await archiveCmsPage(id); fetchData(); } catch (e: any) { alert(e.message); } finally { setActionLoading(null); }
  };

  const handleCreate = async () => {
    if (!form.slug || !form.title) return;
    setCreating(true);
    try { await createCmsPage(form as any); setShowCreate(false); setForm({ slug: '', title: '', type: 'PAGE', status: 'DRAFT', content: '', excerpt: '' }); fetchData(); }
    catch (e: any) { alert(e.message); } finally { setCreating(false); }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (r: CmsPage) => <div><p className="font-medium text-gray-800">{r.title}</p><p className="text-xs text-gray-400">/{r.slug}</p></div> },
    { key: 'type', label: 'Type', render: (r: CmsPage) => <span className="capitalize text-gray-600">{r.type}</span> },
    { key: 'status', label: 'Status', render: (r: CmsPage) => <StatusBadge value={r.status} /> },
    { key: 'updatedAt', label: 'Last Updated', render: (r: CmsPage) => new Date(r.updatedAt).toLocaleDateString('en-IN') },
    { key: 'actions', label: '', render: (r: CmsPage) => (
      <div className="flex gap-2">
        {r.status !== 'PUBLISHED' && <button onClick={e => { e.stopPropagation(); handlePublish(r.id); }} disabled={actionLoading === r.id} className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50">Publish</button>}
        {r.status !== 'ARCHIVED' && <button onClick={e => { e.stopPropagation(); handleArchive(r.id); }} disabled={actionLoading === r.id} className="text-gray-400 hover:text-gray-600 text-xs font-medium disabled:opacity-50">Archive</button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">CMS Pages</h1><p className="text-gray-400 text-sm">Manage website content</p></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Page
        </button>
      </div>

      <DataTable columns={columns as any} data={data?.items ?? []} loading={loading} />
      {data && <Pagination pagination={data.pagination} onPageChange={setPage} />}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Create New Page</h2>
            {[
              { label: 'Title', key: 'title', type: 'text', placeholder: 'Page Title' },
              { label: 'Slug', key: 'slug', type: 'text', placeholder: 'page-slug' },
              { label: 'Excerpt', key: 'excerpt', type: 'text', placeholder: 'Brief description…' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                  {['PAGE', 'BLOG', 'FAQ', 'TERMS', 'PRIVACY'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                  {['DRAFT', 'PUBLISHED'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} placeholder="Page content (Markdown supported)…" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
