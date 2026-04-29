'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  enquiry: {
    id: string;
    name: string;
    email: string;
    phone: string;
    budget: number | null;
    message: string;
    listingId: string | null;
  };
}

/**
 * Single-click "convert to lead" — POSTs /api/leads with enquiryId and the
 * enquiry's contact details. Navigates to the new lead on success.
 */
export function ConvertEnquiryButton({ enquiry }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function convert() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          budget: enquiry.budget ?? undefined,
          notes: enquiry.message,
          listingId: enquiry.listingId ?? undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      const body = await res.json();
      router.push(`/dashboard/leads/${body.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {err && <span className="text-xs text-danger">{err}</span>}
      <button
        onClick={convert}
        disabled={busy}
        className="bg-ink px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-bone hover:bg-gulf disabled:opacity-50"
        data-cursor="convert"
      >
        {busy ? 'Converting…' : 'Convert to lead'}
      </button>
    </div>
  );
}
