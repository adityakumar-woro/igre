'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface AreaOption { id: string; slug: string; name: string }

const TYPES = [
  { v: '', label: 'All' },
  { v: 'SALE', label: 'For sale' },
  { v: 'RENT', label: 'For rent' },
];
const PROPS = [
  { v: '', label: 'Any property' },
  { v: 'APARTMENT', label: 'Apartment' },
  { v: 'VILLA', label: 'Villa' },
  { v: 'TOWNHOUSE', label: 'Townhouse' },
  { v: 'PENTHOUSE', label: 'Penthouse' },
];
const BEDS = [
  { v: '', label: 'Any beds' },
  { v: '1', label: '1+' },
  { v: '2', label: '2+' },
  { v: '3', label: '3+' },
  { v: '4', label: '4+' },
];

export function ListingFilters({ areas }: { areas: AreaOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    start(() => router.push(`/listings?${next.toString()}`));
  };

  const selectClass =
    'border-0 border-b border-line bg-transparent py-3 pr-8 text-sm uppercase tracking-[0.14em] text-ink focus:border-ink focus:outline-none cursor-pointer';

  return (
    <div className={`grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 ${pending ? 'opacity-70' : ''}`}>
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
        <option value="">Any area</option>
        {areas.map((a) => <option key={a.id} value={a.slug}>{a.name}</option>)}
      </select>

      <select
        className={selectClass}
        value={params.get('propertyType') ?? ''}
        onChange={(e) => setParam('propertyType', e.target.value)}
        aria-label="Property type"
      >
        {PROPS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
      </select>

      <select
        className={selectClass}
        value={params.get('bedrooms') ?? ''}
        onChange={(e) => setParam('bedrooms', e.target.value)}
        aria-label="Bedrooms"
      >
        {BEDS.map((b) => <option key={b.v} value={b.v}>{b.label}</option>)}
      </select>
    </div>
  );
}
