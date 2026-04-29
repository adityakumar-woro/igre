import Link from 'next/link';
import { RevealImage } from '@/components/motion/RevealImage';
import { formatAED, formatSqft } from '@/lib/format';

export interface ListingCardData {
  id: string;
  slug: string;
  reference: string;
  title: string;
  bedrooms: number;
  sqft: number;
  price: number;
  listingType: string;
  propertyType: string;
  coverImageUrl: string;
  area: { name: string };
}

export function ListingCard({ listing, eager = false }: { listing: ListingCardData; eager?: boolean }) {
  const isRent = listing.listingType === 'RENT';
  return (
    <Link
      href={`/listings/${listing.slug}`}
      data-cursor="view"
      className="group block"
    >
      <div className="overflow-hidden">
        <RevealImage
          src={listing.coverImageUrl}
          alt={listing.title}
          priority={eager}
          className="aspect-[4/5] w-full transition-transform duration-700 ease-editorial group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
          {listing.area.name}
        </p>
        <p className="tnum font-mono text-[10px] tracking-[0.12em] text-mute">
          {listing.reference}
        </p>
      </div>
      <h3 className="mt-3 font-display text-xl leading-[1.15] tracking-editorial md:text-2xl">
        {listing.title}
      </h3>
      <p className="tnum mt-4 text-sm text-mute">
        {listing.bedrooms}BR · {formatSqft(listing.sqft)} · {formatAED(listing.price, { compact: true })}
        {isRent ? '/yr' : ''}
      </p>
    </Link>
  );
}
