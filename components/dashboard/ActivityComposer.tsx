'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TYPES = [
  { v: 'note',    label: 'Note' },
  { v: 'call',    label: 'Call' },
  { v: 'whatsapp', label: 'WhatsApp' },
  { v: 'email',   label: 'Email' },
  { v: 'meeting', label: 'Meeting' },
  { v: 'viewing', label: 'Viewing' },
];

export function ActivityComposer({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [type, setType] = useState('note');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!content.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content: content.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      setContent('');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border border-line bg-bone p-5">
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t.v}
            onClick={() => setType(t.v)}
            className={cn(
              'border px-3 py-1 text-xs uppercase tracking-[0.12em] transition',
              type === t.v ? 'border-ink bg-ink text-bone' : 'border-line text-mute hover:border-ink hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="What happened?"
        className="w-full resize-none border border-line bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
      />
      {err && <p className="text-xs text-danger">{err}</p>}
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={busy || !content.trim()}
          className="bg-ink px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-bone hover:bg-gulf disabled:opacity-50"
          data-cursor="log"
        >
          {busy ? 'Logging…' : 'Log activity'}
        </button>
      </div>
    </div>
  );
}
