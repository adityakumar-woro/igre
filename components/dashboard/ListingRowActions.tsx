'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  listingId: string;
  status: string;
  isAdmin: boolean;
  isOwner: boolean;
}

/**
 * Inline row actions:
 * - Edit (always)
 * - Submit for review (DRAFT → PENDING, owner only)
 * - Publish (PENDING → PUBLISHED, ADMIN only)
 * - Unpublish (PUBLISHED → ARCHIVED, ADMIN only)
 */
export function ListingRowActions({ listingId, status, isAdmin, isOwner }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function call(path: string) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(path, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || 'Failed');
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      {err && <span className="text-danger">{err}</span>}

      <Link
        href={`/dashboard/listings/${listingId}/edit`}
        className="text-mute hover:text-ink"
        data-cursor="edit"
      >
        Edit
      </Link>

      {isOwner && status === 'DRAFT' && (
        <button
          disabled={busy}
          onClick={() => call(`/api/listings/${listingId}/submit`)}
          className="text-gold hover:text-ink disabled:opacity-50"
        >
          Submit
        </button>
      )}

      {isAdmin && status === 'PENDING' && (
        <button
          disabled={busy}
          onClick={() => call(`/api/listings/${listingId}/publish`)}
          className="text-success hover:text-ink disabled:opacity-50"
        >
          Publish
        </button>
      )}

      {isAdmin && status === 'PUBLISHED' && (
        <button
          disabled={busy}
          onClick={() => call(`/api/listings/${listingId}/archive`)}
          className="text-danger hover:text-ink disabled:opacity-50"
        >
          Archive
        </button>
      )}
    </div>
  );
}
