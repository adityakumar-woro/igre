'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

interface AreaOption { id: string; slug: string; name: string }

const STATUSES = [
  { v: '', label: 'All statuses' },
  { v: 'DRAFT', label: 'Draft' },
  { v: 'PENDING', label: 'Pending' },
  { v: 'PUBLISHED', label: 'Published' },
  { v: 'RESERVED', label: 'Reserved' },
  { v: 'SOLD_RENTED', label: 'Closed' },
  { v: 'ARCHIVED', label: 'Archived' },
];

const TYPES = [
  { v: '', label: 'All types' },
  { v: 'SALE', label: 'For sale' },
  { v: 'RENT', label: 'For rent' },
  { v: 'LEASE', label: 'Lease' },
];

export function DashboardListingFilters({ areas }: { areas: AreaOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get('q') ?? '');

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set('q', q); else next.delete('q');
      next.delete('page');
      const target = `/dashboard/listings?${next.toString()}`;
      if (target !== `/dashboard/listings?${params.toString()}`) {
        start(() => router.push(target));
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    start(() => router.push(`/dashboard/listings?${next.toString()}`));
  };

  const selectClass =
    'w-full border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer';

  return (
    <div className={`grid grid-cols-1 gap-3 md:grid-cols-4 ${pending ? 'opacity-70' : ''}`}>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by reference or title…"
        className={selectClass.replace('cursor-pointer', '')}
        aria-label="Search"
      />
      <select
        className={selectClass}
        value={params.get('status') ?? ''}
        onChange={(e) => setParam('status', e.target.value)}
        aria-label="Status"
      >
        {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
      </select>
      <select
        className={selectClass}
        value={params.get('listingType') ?? ''}
        onChange={(e) => setParam('listingType', e.target.value)}
        aria-label="Listing type"
      >
        {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
      </select>
      <select
        className={selectClass}
        value={params.get('area') ?? ''}
        onChange={(e) => setParam('area', e.target.value)}
        aria-label="Area"
      >
        <option value="">All areas</option>
        {areas.map((a) => <option key={a.id} value={a.slug}>{a.name}</option>)}
      </select>
    </div>
  );
}
