import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { LeadKanban, type LeadCard } from '@/components/dashboard/LeadKanban';

export const metadata = { title: 'Leads · Dashboard', robots: { index: false } };

export default async function LeadsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === 'ADMIN';

  const leads = await db.lead.findMany({
    where: isAdmin ? {} : { agentId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      listing: { select: { slug: true, title: true, reference: true } },
      agent: { select: { id: true, name: true } },
    },
  });

  const data: LeadCard[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    budget: l.budget,
    status: l.status,
    notes: l.notes,
    createdAt: l.createdAt,
    nextFollowUpAt: l.nextFollowUpAt,
    listing: l.listing,
    agent: l.agent,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Leads pipeline</p>
          <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} in flight.
          </h1>
        </div>
        <p className="text-xs text-mute">Drag a card between columns to update status.</p>
      </div>

      {leads.length === 0 ? (
        <div className="border border-line bg-bone p-16 text-center">
          <p className="font-display text-3xl tracking-editorial">No leads yet.</p>
          <p className="mt-3 text-mute">Convert an enquiry to start your pipeline.</p>
        </div>
      ) : (
        <LeadKanban leads={data} isAdmin={isAdmin} currentUserId={userId} />
      )}
    </div>
  );
}
