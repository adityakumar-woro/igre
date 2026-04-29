'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PendingActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function call(action: 'publish' | 'archive') {
    setBusy(action);
    setErr(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/${action}`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {err && <span className="text-xs text-danger">{err}</span>}
      <div className="flex gap-2">
        <button
          onClick={() => call('publish')}
          disabled={!!busy}
          className="bg-success/10 border border-success/30 px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-success hover:bg-success/20 disabled:opacity-50"
          data-cursor="publish"
        >
          {busy === 'publish' ? 'Publishing…' : 'Publish'}
        </button>
        <button
          onClick={() => call('archive')}
          disabled={!!busy}
          className="bg-danger/5 border border-danger/30 px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-danger hover:bg-danger/10 disabled:opacity-50"
          data-cursor="reject"
        >
          {busy === 'archive' ? 'Archiving…' : 'Reject'}
        </button>
      </div>
    </div>
  );
}
