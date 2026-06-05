'use client';
import React from 'react';

type Color = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'indigo' | 'slate';

interface Props {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: Color;
  suffix?: string;
  loading?: boolean;
}

const colorConfig: Record<Color, { bg: string; iconBg: string; text: string; accent: string }> = {
  green: { bg: 'from-green-50 to-emerald-50', iconBg: 'bg-green-500', text: 'text-green-600', accent: 'border-green-200' },
  blue: { bg: 'from-blue-50 to-cyan-50', iconBg: 'bg-blue-500', text: 'text-blue-600', accent: 'border-blue-200' },
  amber: { bg: 'from-amber-50 to-yellow-50', iconBg: 'bg-amber-500', text: 'text-amber-600', accent: 'border-amber-200' },
  red: { bg: 'from-red-50 to-rose-50', iconBg: 'bg-red-500', text: 'text-red-600', accent: 'border-red-200' },
  purple: { bg: 'from-purple-50 to-violet-50', iconBg: 'bg-purple-500', text: 'text-purple-600', accent: 'border-purple-200' },
  indigo: { bg: 'from-indigo-50 to-violet-50', iconBg: 'bg-indigo-500', text: 'text-indigo-600', accent: 'border-indigo-200' },
  slate: { bg: 'from-slate-50 to-gray-50', iconBg: 'bg-slate-500', text: 'text-slate-600', accent: 'border-slate-200' },
};

export default function StatCard({ title, value, change, icon = '📊', color = 'indigo', suffix, loading = false }: Props) {
  const cfg = colorConfig[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="h-4 w-24 skeleton mb-4" />
        <div className="h-8 w-32 skeleton mb-2" />
        <div className="h-3 w-20 skeleton" />
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} rounded-xl border ${cfg.accent} p-5 shadow-sm dash-card`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-9 h-9 ${cfg.iconBg} rounded-lg flex items-center justify-center text-white text-base shadow-sm`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900 animate-count-up">
          {suffix && <span className="text-base font-semibold text-gray-500 mr-0.5">{suffix}</span>}
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {change >= 0 ? (
            <span className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +{change}%
            </span>
          ) : (
            <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              {change}%
            </span>
          )}
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
