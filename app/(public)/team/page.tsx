import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { TeamGrid } from '@/components/public/TeamGrid';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Four people. Direct phone, direct email.',
};

export default async function TeamPage() {
  const team = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] } },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, bio: true, phone: true, email: true, role: true, avatarUrl: true },
  });
  return (
    <div className="pt-32 md:pt-40">
      <div className="container-editorial mb-16">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Team</p>
        <h1 className="mt-4 max-w-[18ch] font-display text-5xl leading-[1.05] tracking-editorial md:text-7xl">
          Four people.<br />Direct phone. Direct email.
        </h1>
      </div>
      <TeamGrid team={team} />
    </div>
  );
}
