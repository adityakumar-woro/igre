import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatAED, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { LeadStatusSelect } from '@/components/dashboard/LeadStatusSelect';
import { ActivityComposer } from '@/components/dashboard/ActivityComposer';

export const metadata = { title: 'Lead · Dashboard', robots: { index: false } };

interface PageProps { params: Promise<{ id: string }> }

const TYPE_LABEL: Record<string, string> = {
  call: 'Call', email: 'Email', whatsapp: 'WhatsApp', meeting: 'Meeting', viewing: 'Viewing', note: 'Note',
};

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await auth();
  const isAdmin = session!.user.role === 'ADMIN';
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, slug: true, title: true, reference: true } },
      enquiry: { select: { id: true, message: true, type: true } },
      agent: { select: { id: true, name: true } },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!lead) notFound();
  if (!isAdmin && lead.agentId !== session!.user.id) redirect('/403');

  // Resolve activity authors in one query
  const authorIds = Array.from(new Set(lead.activities.map((a) => a.createdById)));
  const authors = authorIds.length
    ? await db.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true } })
    : [];
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-12">
      <div>
        <Link href="/dashboard/leads" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
          ← Pipeline
        </Link>
        <h1 className="mt-4 font-display text-4xl tracking-editorial md:text-5xl">{lead.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mute">
          <a href={`tel:${lead.phone}`} className="hover:text-gold" data-cursor="call">{lead.phone}</a>
          <a href={`mailto:${lead.email}`} className="hover:text-gold" data-cursor="email">{lead.email}</a>
          {lead.budget && (
            <span className="tnum text-ink">Budget: {formatAED(lead.budget, { compact: true })}</span>
          )}
          {isAdmin && (
            <span className="text-mute">@ {lead.agent.name}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Activity column */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-editorial md:text-3xl">Activity</h2>
            <p className="text-xs text-mute">{lead.activities.length} entries</p>
          </div>

          <ActivityComposer leadId={lead.id} />

          <div className="mt-10 space-y-0 border-l border-line">
            {lead.activities.length === 0 ? (
              <p className="py-6 pl-6 text-sm text-mute">No activity yet. Log a call, note, or email above.</p>
            ) : (
              lead.activities.map((a) => (
                <article key={a.id} className="relative py-5 pl-6">
                  <span className="absolute -left-[5px] top-7 h-2 w-2 rounded-full bg-gold" />
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-mute">
                      {TYPE_LABEL[a.type] ?? a.type}
                    </span>
                    <span className="font-mono text-[10px] text-mute">
                      {formatDate(a.createdAt)} · {authorMap[a.createdById] ?? 'someone'}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink/85">{a.content}</p>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Sidebar — status + connections */}
        <aside className="space-y-8">
          <div className="border border-line bg-bone p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Status</p>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={lead.status} />
            </div>
            <div className="mt-4">
              <LeadStatusSelect leadId={lead.id} status={lead.status} />
            </div>
            {lead.nextFollowUpAt && (
              <p className="mt-4 text-xs text-mute">
                Next follow-up: <span className="text-ink">{formatDate(lead.nextFollowUpAt)}</span>
              </p>
            )}
          </div>

          {lead.notes && (
            <div className="border border-line bg-bone p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Notes</p>
              <p className="mt-3 whitespace-pre-line text-sm text-ink/85">{lead.notes}</p>
            </div>
          )}

          {lead.listing && (
            <div className="border border-line bg-bone p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Property</p>
              <p className="mt-2 font-mono text-xs text-mute">{lead.listing.reference}</p>
              <Link
                href={`/dashboard/listings/${lead.listing.id}/edit`}
                className="mt-2 block hover:text-gold"
                data-cursor="open"
              >
                {lead.listing.title}
              </Link>
            </div>
          )}

          {lead.enquiry && (
            <div className="border border-line bg-bone p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">From enquiry</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">{lead.enquiry.type}</p>
              <p className="mt-3 whitespace-pre-line text-sm text-ink/85">{lead.enquiry.message}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
