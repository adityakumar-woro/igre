'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = [
  { v: 'NEW', label: 'New' },
  { v: 'CONTACTED', label: 'Contacted' },
  { v: 'VIEWING_SCHEDULED', label: 'Viewing scheduled' },
  { v: 'NEGOTIATING', label: 'Negotiating' },
  { v: 'WON', label: 'Won' },
  { v: 'LOST', label: 'Lost' },
];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(status);
  const router = useRouter();

  return (
    <div>
      <select
        value={value}
        disabled={pending}
        onChange={async (e) => {
          const next = e.target.value;
          setValue(next);
          setError(null);
          start(async () => {
            try {
              const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next }),
              });
              if (!res.ok) throw new Error('Failed');
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed');
              setValue(status);
            }
          });
        }}
        className="border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none cursor-pointer disabled:opacity-50"
      >
        {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
