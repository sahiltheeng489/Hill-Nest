'use client';
import React, { useEffect, useState } from 'react';
import { getRoles, getAllPermissions, createRole, updateRolePermissions } from '../../../services/adminApi';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([getRoles(), getAllPermissions()]);
      setRoles(r as any[]);
      setPermissions(p as Record<string, any[]>);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const selectRole = (role: any) => {
    setSelectedRole(role);
    const ids = new Set<string>(role.permissions?.map((rp: any) => rp.permission.id) ?? []);
    setSelectedPerms(ids);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try { await updateRolePermissions(selectedRole.id, Array.from(selectedPerms)); fetchData(); alert('Permissions saved!'); }
    catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!newRoleName) return;
    setCreating(true);
    try { await createRole({ name: newRoleName, description: newRoleDesc }); setShowCreate(false); setNewRoleName(''); setNewRoleDesc(''); fetchData(); }
    catch (e: any) { alert(e.message); } finally { setCreating(false); }
  };

  return (
    <div className="space-y-5 text-white">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Roles & Permissions</h1><p className="text-sm text-white/45">Manage RBAC configuration</p></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white">
          + New Role
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Roles list */}
        <div className="col-span-2 overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold text-white">Roles</h2></div>
          <div className="divide-y divide-white/8">
            {loading ? <div className="p-6 text-center text-white/45">Loading…</div> : roles.map(role => (
              <button key={role.id} onClick={() => selectRole(role)} className={`w-full text-left px-5 py-4 transition-colors ${selectedRole?.id === role.id ? 'border-l-2 border-[#6F9487] bg-white/12' : 'hover:bg-white/8'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{role.name}</p>
                    {role.description && <p className="mt-0.5 text-xs text-white/45">{role.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {role.isSystem && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/75">System</span>}
                    <span className="text-xs text-white/45">{role._count?.users ?? role.users?.length ?? 0} users</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions editor */}
        <div className="col-span-3 overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-[0_14px_30px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-semibold text-white">Permissions: {selectedRole.name}</h2>
                <button onClick={handleSavePermissions} disabled={saving || selectedRole.isSystem} className="rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
              <div className="max-h-[calc(100vh-300px)] space-y-5 overflow-y-auto p-5">
                {selectedRole.isSystem && (
                  <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                    ⚠️ System roles cannot be modified to prevent security issues.
                  </div>
                )}
                {Object.entries(permissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40 capitalize">{resource}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm: any) => (
                        <label key={perm.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${selectedPerms.has(perm.id) ? 'border-white/10 bg-white/12' : 'border-white/8 hover:bg-white/8'} ${selectedRole.isSystem ? 'cursor-not-allowed opacity-60' : ''}`}>
                          <input type="checkbox" checked={selectedPerms.has(perm.id)} onChange={e => { const s = new Set(selectedPerms); if (e.target.checked) s.add(perm.id); else s.delete(perm.id); setSelectedPerms(s); }} disabled={selectedRole.isSystem} className="rounded text-[#6F9487]" />
                          <div>
                            <p className="text-xs font-medium text-white">{perm.name}</p>
                            {perm.description && <p className="text-[11px] text-white/45">{perm.description}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-white/25">
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              <p className="text-sm">Select a role to manage permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create role modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(4,21,26,0.68)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.94),rgba(9,40,40,0.82))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
            <h2 className="text-lg font-bold text-white">Create New Role</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/75">Role Name</label>
              <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Support Team" className="w-full rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/75">Description</label>
              <input value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Optional description…" className="w-full rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-teal-200/15 backdrop-blur-md" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-white/75 hover:bg-white/12">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !newRoleName} className="rounded-lg bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
