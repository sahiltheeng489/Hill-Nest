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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">Roles & Permissions</h1><p className="text-gray-400 text-sm">Manage RBAC configuration</p></div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          + New Role
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Roles list */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Roles</h2></div>
          <div className="divide-y divide-gray-50">
            {loading ? <div className="p-6 text-center text-gray-400">Loading…</div> : roles.map(role => (
              <button key={role.id} onClick={() => selectRole(role)} className={`w-full text-left px-5 py-4 transition-colors ${selectedRole?.id === role.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{role.name}</p>
                    {role.description && <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {role.isSystem && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">System</span>}
                    <span className="text-xs text-gray-400">{role._count?.users ?? role.users?.length ?? 0} users</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions editor */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {selectedRole ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Permissions: {selectedRole.name}</h2>
                <button onClick={handleSavePermissions} disabled={saving || selectedRole.isSystem} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
              <div className="p-5 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
                {selectedRole.isSystem && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    ⚠️ System roles cannot be modified to prevent security issues.
                  </div>
                )}
                {Object.entries(permissions).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 capitalize">{resource}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm: any) => (
                        <label key={perm.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedPerms.has(perm.id) ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100 hover:bg-gray-50'} ${selectedRole.isSystem ? 'cursor-not-allowed opacity-60' : ''}`}>
                          <input type="checkbox" checked={selectedPerms.has(perm.id)} onChange={e => { const s = new Set(selectedPerms); if (e.target.checked) s.add(perm.id); else s.delete(perm.id); setSelectedPerms(s); }} disabled={selectedRole.isSystem} className="rounded text-indigo-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{perm.name}</p>
                            {perm.description && <p className="text-[11px] text-gray-400">{perm.description}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              <p className="text-sm">Select a role to manage permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create role modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Create New Role</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Support Team" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="Optional description…" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !newRoleName} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
