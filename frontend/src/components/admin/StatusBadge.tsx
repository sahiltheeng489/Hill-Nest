'use client';
import React from 'react';

type BadgeVariant = 'booking' | 'payment' | 'refund' | 'ticket' | 'user';

const colorMap: Record<string, string> = {
  // Booking statuses
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  CONFIRMED: 'bg-green-100 text-green-700 ring-green-200',
  COMPLETED: 'bg-blue-100 text-blue-700 ring-blue-200',
  CANCELLED: 'bg-red-100 text-red-700 ring-red-200',
  REFUNDED: 'bg-purple-100 text-purple-700 ring-purple-200',
  // Payment statuses
  CREATED: 'bg-gray-100 text-gray-600 ring-gray-200',
  PAID: 'bg-green-100 text-green-700 ring-green-200',
  FAILED: 'bg-red-100 text-red-700 ring-red-200',
  PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-700 ring-orange-200',
  // Refund statuses
  APPROVED: 'bg-green-100 text-green-700 ring-green-200',
  REJECTED: 'bg-red-100 text-red-700 ring-red-200',
  PROCESSED: 'bg-blue-100 text-blue-700 ring-blue-200',
  // Ticket statuses
  OPEN: 'bg-blue-100 text-blue-700 ring-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 ring-amber-200',
  RESOLVED: 'bg-green-100 text-green-700 ring-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 ring-gray-200',
  // User statuses
  ACTIVE: 'bg-green-100 text-green-700 ring-green-200',
  SUSPENDED: 'bg-red-100 text-red-700 ring-red-200',
  LOCKED: 'bg-orange-100 text-orange-700 ring-orange-200',
  PENDING_VERIFICATION: 'bg-blue-100 text-blue-700 ring-blue-200',
  // Priority
  LOW: 'bg-gray-100 text-gray-600 ring-gray-200',
  MEDIUM: 'bg-amber-100 text-amber-700 ring-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 ring-orange-200',
  URGENT: 'bg-red-100 text-red-700 ring-red-200',
  // CMS statuses
  DRAFT: 'bg-gray-100 text-gray-600 ring-gray-200',
  PUBLISHED: 'bg-green-100 text-green-700 ring-green-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

interface Props {
  value: string;
  variant?: BadgeVariant;
}

export default function StatusBadge({ value }: Props) {
  const colors = colorMap[value?.toUpperCase()] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  const label = value?.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${colors}`}>
      {label}
    </span>
  );
}
