import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Viewings', robots: { index: false } };

export default async function ViewingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const viewings = await db.viewingRequest.findMany({
    where: { userId },
    orderBy: { preferredDate: 'asc' },
    include: { listing: { select: { slug: true, title: true } } },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Viewings</p>
      <h1 className="mt-4 font-display text-5xl tracking-editorial md:text-6xl">
        {viewings.length === 0 ? 'No viewings booked.' : `${viewings.length} on the calendar.`}
      </h1>

      {viewings.length === 0 ? (
        <p className="mt-8 text-mute">
          Request a viewing from any listing page.{' '}
          <Link href="/listings" className="text-ink hover:text-gold">Browse listings →</Link>
        </p>
      ) : (
        <ul className="mt-16 divide-y divide-line border-y border-line">
          {viewings.map((v) => (
            <li key={v.id} className="grid grid-cols-12 items-baseline gap-4 py-6">
              <span className="col-span-3 text-sm">{formatDate(v.preferredDate)}, {v.preferredTime}</span>
              <span className="col-span-7">
                {v.listing && (
                  <Link href={`/listings/${v.listing.slug}`} className="hover:text-gold">{v.listing.title}</Link>
                )}
              </span>
              <span className="col-span-2 text-right text-xs uppercase tracking-[0.18em] text-mute">{v.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
