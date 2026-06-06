'use client';
import React from 'react';

type BadgeVariant = 'booking' | 'payment' | 'refund' | 'ticket' | 'user';

const colorMap: Record<string, string> = {
  // Booking statuses
  PENDING: 'bg-white/8 text-[#E7E7E7] ring-white/10',
  CONFIRMED: 'bg-[#163E3C]/55 text-white ring-white/10',
  COMPLETED: 'bg-[#092828]/70 text-[#E7E7E7] ring-white/10',
  CANCELLED: 'bg-red-500/15 text-red-100 ring-red-200/20',
  REFUNDED: 'bg-[#325F57]/45 text-white ring-white/10',
  // Payment statuses
  CREATED: 'bg-white/8 text-white/70 ring-white/10',
  PAID: 'bg-[#325F57]/45 text-white ring-white/10',
  FAILED: 'bg-red-500/15 text-red-100 ring-red-200/20',
  PARTIALLY_REFUNDED: 'bg-[#163E3C]/45 text-white ring-white/10',
  // Refund statuses
  APPROVED: 'bg-[#325F57]/45 text-white ring-white/10',
  REJECTED: 'bg-red-500/15 text-red-100 ring-red-200/20',
  PROCESSED: 'bg-[#092828]/70 text-[#E7E7E7] ring-white/10',
  // Ticket statuses
  OPEN: 'bg-white/8 text-white/75 ring-white/10',
  IN_PROGRESS: 'bg-[#163E3C]/45 text-white ring-white/10',
  RESOLVED: 'bg-[#325F57]/45 text-white ring-white/10',
  CLOSED: 'bg-white/8 text-white/60 ring-white/10',
  // User statuses
  ACTIVE: 'bg-[#163E3C]/45 text-white ring-white/10',
  SUSPENDED: 'bg-red-500/15 text-red-100 ring-red-200/20',
  LOCKED: 'bg-[#092828]/70 text-[#E7E7E7] ring-white/10',
  PENDING_VERIFICATION: 'bg-white/8 text-white/75 ring-white/10',
  // Priority
  LOW: 'bg-white/8 text-white/60 ring-white/10',
  MEDIUM: 'bg-[#163E3C]/45 text-white ring-white/10',
  HIGH: 'bg-[#325F57]/45 text-white ring-white/10',
  URGENT: 'bg-red-500/15 text-red-100 ring-red-200/20',
  // CMS statuses
  DRAFT: 'bg-white/8 text-white/65 ring-white/10',
  PUBLISHED: 'bg-[#325F57]/45 text-white ring-white/10',
  ARCHIVED: 'bg-[#092828]/70 text-[#E7E7E7] ring-white/10',
};

interface Props {
  value: string;
  variant?: BadgeVariant;
}

export default function StatusBadge({ value }: Props) {
  const colors = colorMap[value?.toUpperCase()] ?? 'bg-white/8 text-white/65 ring-white/10';
  const label = value?.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${colors}`}>
      {label}
    </span>
  );
}
