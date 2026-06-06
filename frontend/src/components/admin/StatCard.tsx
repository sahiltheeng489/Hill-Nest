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
  green: { bg: 'from-[#092828]/90 to-[#163E3C]/80', iconBg: 'bg-[#325F57]', text: 'text-[#E7E7E7]', accent: 'border-white/10' },
  blue: { bg: 'from-[#04151A]/90 to-[#092828]/80', iconBg: 'bg-[#163E3C]', text: 'text-[#E7E7E7]', accent: 'border-white/10' },
  amber: { bg: 'from-[#163E3C]/90 to-[#325F57]/80', iconBg: 'bg-[#6F9487]', text: 'text-[#FFFFFF]', accent: 'border-white/10' },
  red: { bg: 'from-[#092828]/90 to-[#04151A]/80', iconBg: 'bg-[#325F57]', text: 'text-[#E7E7E7]', accent: 'border-white/10' },
  purple: { bg: 'from-[#163E3C]/90 to-[#092828]/80', iconBg: 'bg-[#325F57]', text: 'text-[#FFFFFF]', accent: 'border-white/10' },
  indigo: { bg: 'from-[#04151A]/90 to-[#163E3C]/80', iconBg: 'bg-[#325F57]', text: 'text-[#FFFFFF]', accent: 'border-white/10' },
  slate: { bg: 'from-[#04151A]/90 to-[#092828]/80', iconBg: 'bg-[#163E3C]', text: 'text-[#E7E7E7]', accent: 'border-white/10' },
};

export default function StatCard({ title, value, change, icon = '📊', color = 'indigo', suffix, loading = false }: Props) {
  const cfg = colorConfig[color];

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
        <div className="h-4 w-24 skeleton mb-4" />
        <div className="h-8 w-32 skeleton mb-2" />
        <div className="h-3 w-20 skeleton" />
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${cfg.bg} rounded-xl border ${cfg.accent} p-5 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md dash-card`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/70">{title}</p>
        <div className={`w-9 h-9 ${cfg.iconBg} rounded-lg flex items-center justify-center text-white text-base shadow-sm`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-white animate-count-up">
          {suffix && <span className="text-base font-semibold text-white/55 mr-0.5">{suffix}</span>}
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {change >= 0 ? (
            <span className="text-xs text-[#6F9487] font-semibold flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +{change}%
            </span>
          ) : (
            <span className="text-xs text-[#9B9B9B] font-semibold flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              {change}%
            </span>
          )}
          <span className="text-xs text-white/45">vs last month</span>
        </div>
      )}
    </div>
  );
}
