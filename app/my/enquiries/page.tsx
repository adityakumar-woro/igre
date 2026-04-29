import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'My enquiries', robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  VIEWING_SCHEDULED: 'Viewing scheduled',
  NEGOTIATING: 'Negotiating',
  WON: 'Closed',
  LOST: 'Closed',
};

export default async function MyEnquiriesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const enquiries = await db.enquiry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: { slug: true, title: true } } },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-mute">My enquiries</p>
      <h1 className="mt-4 font-display text-5xl tracking-editorial md:text-6xl">
        {enquiries.length === 0 ? 'No enquiries yet.' : `${enquiries.length} on file.`}
      </h1>

      {enquiries.length === 0 ? (
        <p className="mt-8 text-mute">
          When you send an enquiry it will appear here.{' '}
          <Link href="/listings" className="text-ink hover:text-gold">Browse listings →</Link>
        </p>
      ) : (
        <ul className="mt-16 divide-y divide-line border-y border-line">
          {enquiries.map((e) => (
            <li key={e.id} className="grid grid-cols-12 items-baseline gap-4 py-6">
              <span className="col-span-3 text-xs text-mute">{formatDate(e.createdAt)}</span>
              <span className="col-span-5">
                {e.listing ? (
                  <Link href={`/listings/${e.listing.slug}`} className="hover:text-gold">{e.listing.title}</Link>
                ) : (
                  <span className="text-mute italic">General enquiry</span>
                )}
              </span>
              <span className="col-span-2 truncate text-sm text-mute">{e.message}</span>
              <span className="col-span-2 text-right text-xs uppercase tracking-[0.18em] text-mute">
                {STATUS_LABEL[e.status] ?? e.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
