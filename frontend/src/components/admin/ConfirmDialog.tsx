'use client';
import React from 'react';

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'danger' | 'default';
  confirmLabel?: string;
  children?: React.ReactNode;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, variant = 'default', confirmLabel, children }: Props) {
  if (!open) return null;

  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(4,21,26,0.74)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-md animate-scale-in rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.92),rgba(9,40,40,0.76))] p-6 text-white shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl">
        {/* Icon */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 ${variant === 'danger' ? 'bg-red-500/15' : 'bg-white/8'}`}>
          {variant === 'danger' ? (
            <svg className="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          ) : (
            <svg className="w-6 h-6 text-teal-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-sm text-white/70 mb-4">{message}</div>

        {/* Additional content (e.g., textarea) */}
        {children && <div className="mb-4">{children}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white/80 bg-white/8 border border-white/10 rounded-lg hover:bg-white/12 disabled:opacity-50 transition-colors backdrop-blur-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-60 transition-all ${btnClass} flex items-center gap-2`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            )}
            {confirmLabel ?? (variant === 'danger' ? 'Confirm' : 'OK')}
          </button>
        </div>
      </div>
    </div>
  );
}
