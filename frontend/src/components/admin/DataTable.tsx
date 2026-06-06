'use client';
import React, { useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  keyField?: keyof T;
}

function getRowValue<T extends object>(row: T, key: keyof T | string) {
  if (typeof key === "string" && key in row) {
    return row[key as keyof T];
  }

  if (typeof key !== "string" && key in row) {
    return row[key];
  }

  return undefined;
}

function SkeletonRows({ count, cols }: { count: number; cols: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-white/8">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded animate-pulse bg-white/10" style={{ width: `${60 + Math.random() * 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function DataTable<T extends object>({ columns, data, loading = false, onRowClick, keyField = 'id' as keyof T }: Props<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = getRowValue(a, sortKey);
      const bv = getRowValue(b, sortKey);
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/8 backdrop-blur-md shadow-[0_14px_30px_rgba(2,6,23,0.18)]">
      <table className="min-w-full divide-y divide-white/8">
        <thead>
          <tr className="bg-white/6">
            {columns.map(col => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(String(col.key))}
                className={`px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider select-none ${col.sortable ? 'cursor-pointer hover:text-white' : ''}`}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-white/25 text-[10px]">
                      {sortKey === String(col.key) ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {loading ? (
            <SkeletonRows count={7} cols={columns.length} />
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center text-white/45">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-sm">No records found</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => (
              <tr
                key={String(getRowValue(row, keyField) ?? i)}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 ${onRowClick ? 'cursor-pointer hover:bg-white/8' : 'hover:bg-white/5'}`}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm text-white/80 whitespace-nowrap">
                    {col.render
                      ? col.render(row)
                      : String(getRowValue(row, col.key) ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
