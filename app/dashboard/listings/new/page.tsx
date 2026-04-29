import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ListingForm } from '@/components/dashboard/ListingForm';

export const metadata = { title: 'New listing', robots: { index: false } };

export default async function NewListingPage() {
  const session = await auth();
  const isAdmin = session!.user.role === 'ADMIN';

  const [areas, agents] = await Promise.all([
    db.area.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } }),
    isAdmin
      ? db.user.findMany({
          where: { role: { in: ['ADMIN', 'MANAGER'] } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true },
        })
      : Promise.resolve(undefined),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">New listing</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          Add a property.
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm text-mute">
          Saves as Draft. Submit it for review when you&apos;re ready — admin will publish.
        </p>
      </div>

      <ListingForm
        mode="create"
        areas={areas}
        agents={agents}
        isAdmin={isAdmin}
        ownerId={session!.user.id}
      />
    </div>
  );
}
