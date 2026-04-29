import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ListingCard } from '@/components/public/ListingCard';
import Link from 'next/link';

export const metadata = { title: 'Favourites', robots: { index: false } };

export default async function FavouritesPage() {
  const session = await auth();
  // layout already redirects unauthenticated users
  const userId = session!.user.id;

  const favourites = await db.favourite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { include: { area: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Saved properties</p>
      <h1 className="mt-4 font-display text-5xl tracking-editorial md:text-6xl">
        {favourites.length === 0 ? 'Nothing saved yet.' : `${favourites.length} saved.`}
      </h1>

      {favourites.length === 0 ? (
        <p className="mt-8 max-w-[50ch] text-mute">
          Tap the heart on any listing to save it here.{' '}
          <Link href="/listings" className="text-ink hover:text-gold">Browse listings →</Link>
        </p>
      ) : (
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
          {favourites.map((f) => (
            <ListingCard
              key={f.id}
              listing={{
                id: f.listing.id,
                slug: f.listing.slug,
                reference: f.listing.reference,
                title: f.listing.title,
                bedrooms: f.listing.bedrooms,
                sqft: f.listing.sqft,
                price: f.listing.price,
                listingType: f.listing.listingType,
                propertyType: f.listing.propertyType,
                coverImageUrl: f.listing.coverImageUrl,
                area: f.listing.area,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
