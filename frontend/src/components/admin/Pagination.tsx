'use client';
import React from 'react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Props {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: Props) {
  const { page, limit, total, pages, hasNext, hasPrev } = pagination;
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const pageNumbers = React.useMemo(() => {
    const arr: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, pages]);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-b-xl border-t border-white/10 bg-white/8 px-4 py-3 backdrop-blur-md">
      <p className="text-sm text-white/60">
        Showing <span className="font-medium text-white">{from}</span> to{' '}
        <span className="font-medium text-white">{to}</span> of{' '}
        <span className="font-medium text-white">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed transition-colors backdrop-blur-md"
        >
          ← Prev
        </button>
        {pageNumbers.map(n => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${n === page ? 'bg-gradient-to-r from-[#163E3C] to-[#6F9487] text-white' : 'border border-white/10 text-white/70 hover:bg-white/12 backdrop-blur-md'}`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/12 disabled:opacity-40 disabled:cursor-not-allowed transition-colors backdrop-blur-md"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
