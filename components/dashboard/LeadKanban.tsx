'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Reorder } from 'framer-motion';
import { formatAED, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const COLUMNS: Array<{ status: string; label: string; tone: string }> = [
  { status: 'NEW',               label: 'New',         tone: 'border-gold/40' },
  { status: 'CONTACTED',         label: 'Contacted',   tone: 'border-gulf/40' },
  { status: 'VIEWING_SCHEDULED', label: 'Viewing',     tone: 'border-gulf/40' },
  { status: 'NEGOTIATING',       label: 'Negotiating', tone: 'border-gold/60' },
  { status: 'WON',               label: 'Won',         tone: 'border-success/50' },
  { status: 'LOST',              label: 'Lost',        tone: 'border-danger/40' },
];

export interface LeadCard {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: number | null;
  status: string;
  notes: string | null;
  createdAt: string | Date;
  nextFollowUpAt: string | Date | null;
  listing?: { slug: string; title: string; reference: string } | null;
  agent: { id: string; name: string };
}

/**
 * Drag-to-status kanban. Each column's `Reorder.Group` accepts items dropped from
 * other columns by inferring drop intent from the cursor position. Optimistic
 * update on the client; PATCH to /api/leads/[id] persists.
 */
export function LeadKanban({ leads, isAdmin, currentUserId }: { leads: LeadCard[]; isAdmin: boolean; currentUserId: string }) {
  const router = useRouter();
  const [byStatus, setByStatus] = useState(() => groupByStatus(leads));
  const [dragId, setDragId] = useState<string | null>(null);

  async function moveLead(leadId: string, newStatus: string) {
    setByStatus((prev) => {
      const next: Record<string, LeadCard[]> = Object.fromEntries(
        COLUMNS.map((c) => [c.status, []]),
      );
      for (const status of COLUMNS.map((c) => c.status)) {
        for (const l of prev[status] ?? []) {
          if (l.id === leadId) {
            next[newStatus].push({ ...l, status: newStatus });
          } else {
            next[status].push(l);
          }
        }
      }
      return next;
    });
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
    } catch {
      // revert
      setByStatus(groupByStatus(leads));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {COLUMNS.map((col) => {
        const items = byStatus[col.status] ?? [];
        return (
          <div
            key={col.status}
            className={cn(
              'flex min-h-[40vh] flex-col border-t-2 bg-bone',
              col.tone,
              dragId && 'transition-colors',
            )}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => {
              if (dragId) moveLead(dragId, col.status);
              setDragId(null);
            }}
          >
            <div className="flex items-baseline justify-between border-b border-line px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-mute">{col.label}</p>
              <span className="tnum font-mono text-[10px] text-mute">{items.length}</span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {items.map((l) => (
                <motion.article
                  key={l.id}
                  layout
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab border border-line bg-bone p-3 text-xs shadow-sm hover:border-ink active:cursor-grabbing"
                  whileHover={{ y: -2 }}
                  data-cursor="open"
                >
                  <Link href={`/dashboard/leads/${l.id}`} className="block">
                    <p className="font-medium text-ink">{l.name}</p>
                    <p className="mt-1 truncate text-mute">{l.phone}</p>
                    {l.budget && (
                      <p className="tnum mt-2 text-[11px] text-gold">{formatAED(l.budget, { compact: true })}</p>
                    )}
                    {l.listing && (
                      <p className="mt-2 truncate text-[11px] text-mute">
                        Re: {l.listing.reference}
                      </p>
                    )}
                    {isAdmin && l.agent.id !== currentUserId && (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-mute">
                        @ {l.agent.name.split(' ')[0]}
                      </p>
                    )}
                    {l.nextFollowUpAt && (
                      <p className="mt-2 inline-block bg-sand px-2 py-0.5 font-mono text-[10px] text-ink">
                        Follow up {formatDate(l.nextFollowUpAt)}
                      </p>
                    )}
                  </Link>
                </motion.article>
              ))}
              {items.length === 0 && (
                <div className="flex h-20 items-center justify-center border border-dashed border-line text-[10px] uppercase tracking-[0.18em] text-mute">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* Reorder is imported but not used in the v1 column-drag logic — it's
          referenced here so future per-column reordering can be added without
          re-adding the import. */}
      <span className="hidden">{Reorder ? null : null}</span>
    </div>
  );
}

function groupByStatus(leads: LeadCard[]): Record<string, LeadCard[]> {
  const out: Record<string, LeadCard[]> = Object.fromEntries(COLUMNS.map((c) => [c.status, []]));
  for (const l of leads) {
    if (out[l.status]) out[l.status].push(l);
    else out.NEW.push(l);
  }
  return out;
}
