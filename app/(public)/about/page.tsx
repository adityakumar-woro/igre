import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { TeamGrid } from '@/components/public/TeamGrid';
import { QuietCTA } from '@/components/public/QuietCTA';

export const metadata: Metadata = {
  title: 'About',
  description: 'A small Abu Dhabi brokerage. Local since day one.',
};

// Hits SQLite at render time — DB only exists at runtime.
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const team = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] } },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, bio: true, phone: true, email: true, role: true, avatarUrl: true },
  });

  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial mb-32 grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">About</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
            A small brokerage,<br />based in Abu Dhabi.
          </h1>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-12">
          <p className="font-display text-2xl leading-[1.4] tracking-editorial md:text-3xl">
            We started IGRE because the city deserved brokers who actually live here.
          </p>
          <div className="mt-10 space-y-6 text-base leading-[1.7] text-ink/85">
            <p>
              Most of the property advice in Abu Dhabi comes from somewhere else — Dubai agencies on a day trip, marketing teams that have never seen the building, listings copy-pasted between sites. We built IGRE to be the opposite of that.
            </p>
            <p>
              Four people, one office on the mainland, six islands we know intimately. We walk every property before we list it. We tell clients when something is wrong for them. We stay reachable after the deal closes — because most of our work comes from people we&apos;ve already helped.
            </p>
            <p>
              We&apos;re open to broker collaborations across the Emirates. We co-broke fairly and we close.
            </p>
          </div>
        </div>
      </div>

      <TeamGrid team={team} />
      <QuietCTA />
    </div>
  );
}
