'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props { id: string; status: string }

export function ViewingStatusActions({ id, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function set(next: string) {
    setBusy(next);
    setErr(null);
    try {
      const res = await fetch(`/api/viewing-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
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

  if (status === 'COMPLETED' || status === 'CANCELLED') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {err && <span className="text-xs text-danger">{err}</span>}
      {status === 'PENDING' && (
        <button
          onClick={() => set('CONFIRMED')}
          disabled={!!busy}
          className="border border-success/40 bg-success/5 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-success hover:bg-success/10 disabled:opacity-50"
          data-cursor="confirm"
        >
          {busy === 'CONFIRMED' ? 'Confirming…' : 'Confirm'}
        </button>
      )}
      {status === 'CONFIRMED' && (
        <button
          onClick={() => set('COMPLETED')}
          disabled={!!busy}
          className="border border-mute/30 bg-sand px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-mute hover:text-ink disabled:opacity-50"
          data-cursor="done"
        >
          {busy === 'COMPLETED' ? 'Marking…' : 'Mark done'}
        </button>
      )}
      <button
        onClick={() => set('CANCELLED')}
        disabled={!!busy}
        className="border border-line px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-mute hover:text-danger disabled:opacity-50"
        data-cursor="cancel"
      >
        Cancel
      </button>
    </div>
  );
}
