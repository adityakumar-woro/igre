import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ListingGallery } from '@/components/public/ListingGallery';
import { ListingEnquiryForm } from '@/components/public/ListingEnquiryForm';
import { FavouriteToggle } from '@/components/public/FavouriteToggle';
import { ListingCard } from '@/components/public/ListingCard';
import { formatAED, formatSqft } from '@/lib/format';
import { safeJsonArray } from '@/lib/utils';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await db.listing.findUnique({ where: { slug }, select: { title: true, metaDescription: true, coverImageUrl: true } });
  if (!listing) return { title: 'Listing' };
  return {
    title: listing.title,
    description: listing.metaDescription ?? listing.title,
    openGraph: { images: [listing.coverImageUrl] },
  };
}

function listingJsonLd(l: { title: string; description: string; price: number; sqft: number; bedrooms: number; bathrooms: number; fullAddress: string; coverImageUrl: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: l.title,
    description: l.description,
    address: l.fullAddress,
    image: l.coverImageUrl,
    numberOfBedrooms: l.bedrooms,
    numberOfBathroomsTotal: l.bathrooms,
    floorSize: { '@type': 'QuantitativeValue', value: l.sqft, unitCode: 'FTK' },
    offers: { '@type': 'Offer', price: l.price, priceCurrency: 'AED' },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      area: true,
      agent: { select: { id: true, name: true, phone: true, email: true, bio: true } },
    },
  });

  if (!listing || (listing.status !== 'PUBLISHED' && session?.user?.role !== 'ADMIN' && session?.user?.id !== listing.agentId)) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  db.listing.update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const images = safeJsonArray<string>(listing.images);
  const gallery = images.length ? images : [listing.coverImageUrl];
  const features = safeJsonArray<string>(listing.features);
  const isRent = listing.listingType === 'RENT';

  // Has the user favourited?
  let isFavourited = false;
  if (session?.user?.id) {
    const fav = await db.favourite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
    });
    isFavourited = !!fav;
  }

  // Related listings — same area, exclude self
  const related = await db.listing.findMany({
    where: { areaId: listing.areaId, status: 'PUBLISHED', id: { not: listing.id } },
    include: { area: { select: { name: true } } },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in ${listing.title} (${listing.reference}). Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${listing.agent.phone?.replace(/\D/g, '') ?? '971581005220'}?text=${whatsappMsg}`;

  return (
    <article className="pt-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(listing)) }}
      />

      <div className="container-editorial">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mute">
          <Link href="/listings" className="hover:text-ink">Listings</Link>
          <span>/</span>
          <Link href={`/areas/${listing.area.slug}`} className="hover:text-ink">{listing.area.name}</Link>
          <span>/</span>
          <span className="text-ink">{listing.reference}</span>
        </div>

        {/* Title block */}
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
              {listing.area.name} · {listing.propertyType.toLowerCase()} · {listing.listingType === 'RENT' ? 'For rent' : 'For sale'}
            </p>
            <h1 className="mt-4 max-w-[24ch] font-display text-4xl leading-[1.05] tracking-editorial md:text-6xl">
              {listing.title}
            </h1>
          </div>
          <FavouriteToggle listingId={listing.id} initial={isFavourited} />
        </div>

        {/* Two-column: gallery sticky on right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ListingGallery images={gallery} alt={listing.title} />

            {/* Description */}
            <div className="mt-16 max-w-[62ch]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">About this property</p>
              <div className="mt-6 whitespace-pre-line text-base leading-[1.7] text-ink/85">
                {listing.description}
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-16">
                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Features</p>
                <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-baseline gap-3 border-b border-line py-2 text-sm">
                      <span className="text-gold">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Spec table */}
            <div className="mt-16">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Specification</p>
              <dl className="tnum mt-6 divide-y divide-line border-y border-line text-sm">
                <Row label="Reference" value={listing.reference} mono />
                <Row label="Bedrooms" value={String(listing.bedrooms)} />
                <Row label="Bathrooms" value={String(listing.bathrooms)} />
                <Row label="Built-up area" value={formatSqft(listing.sqft)} />
                {listing.pricePerSqft && <Row label="Price per sqft" value={formatAED(listing.pricePerSqft)} />}
                <Row label="Parking" value={`${listing.parkingSpaces} space${listing.parkingSpaces !== 1 ? 's' : ''}`} />
                <Row label="Furnished" value={listing.furnished ? 'Yes' : 'No'} />
                {listing.yearBuilt && <Row label="Year built" value={String(listing.yearBuilt)} />}
                {listing.serviceCharges && <Row label="Service charges" value={`${formatAED(listing.serviceCharges)}/yr`} />}
                {listing.paymentPlan && <Row label="Payment plan" value={listing.paymentPlan} />}
                <Row label="Building" value={listing.buildingName ?? '—'} />
                {listing.floorNumber !== null && <Row label="Floor" value={String(listing.floorNumber)} />}
              </dl>
            </div>

            {/* Map */}
            {listing.latitude && listing.longitude && (
              <div className="mt-16">
                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Location</p>
                <p className="mt-2 text-sm text-mute">{listing.fullAddress}</p>
                <div className="mt-6 aspect-[16/9] w-full overflow-hidden bg-sand">
                  <iframe
                    title={`Map of ${listing.title}`}
                    src={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky details */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="border border-line bg-bone p-8 md:p-10">
                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">
                  {isRent ? 'Annual rent' : 'Asking price'}
                </p>
                <p className="tnum mt-3 font-display text-4xl leading-none tracking-editorial md:text-5xl">
                  {formatAED(listing.price)}
                  {isRent && <span className="text-2xl text-mute"> /yr</span>}
                </p>
                <p className="mt-2 text-xs text-mute">
                  {listing.bedrooms}BR · {listing.bathrooms} bath · {formatSqft(listing.sqft)}
                </p>

                <div className="rule my-8" />

                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Talk to a broker</p>
                <p className="mt-3 font-display text-2xl tracking-editorial">{listing.agent.name}</p>
                {listing.agent.bio && <p className="mt-2 text-xs text-mute">{listing.agent.bio}</p>}
                <div className="mt-5 flex flex-col gap-3 text-sm">
                  {listing.agent.phone && (
                    <a
                      href={`tel:${listing.agent.phone.replace(/\s/g, '')}`}
                      data-cursor="call"
                      className="inline-flex items-center justify-between border-b border-line py-2 hover:text-gold"
                    >
                      <span>{listing.agent.phone}</span>
                      <span>↗</span>
                    </a>
                  )}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="whatsapp"
                    className="inline-flex items-center justify-between border-b border-line py-2 hover:text-gold"
                  >
                    <span>WhatsApp</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={`mailto:${listing.agent.email}?subject=${encodeURIComponent(listing.reference)}`}
                    data-cursor="email"
                    className="inline-flex items-center justify-between border-b border-line py-2 hover:text-gold"
                  >
                    <span>Email</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <div className="mt-8 border border-line bg-bone p-8 md:p-10">
                <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Send an enquiry</p>
                <div className="mt-6">
                  <ListingEnquiryForm
                    listingId={listing.id}
                    listingTitle={listing.title}
                    agentName={listing.agent.name}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-32 border-t border-line pt-20">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-editorial md:text-4xl">
                More on {listing.area.name}.
              </h2>
              <Link href={`/areas/${listing.area.slug}`} className="text-[11px] uppercase tracking-[0.28em] text-mute hover:text-ink" data-cursor="see all">
                Browse area →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-3">
              {related.map((r) => (
                <ListingCard
                  key={r.id}
                  listing={{
                    id: r.id,
                    slug: r.slug,
                    reference: r.reference,
                    title: r.title,
                    bedrooms: r.bedrooms,
                    sqft: r.sqft,
                    price: r.price,
                    listingType: r.listingType,
                    propertyType: r.propertyType,
                    coverImageUrl: r.coverImageUrl,
                    area: r.area,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <p className="container-editorial mt-24 max-w-[60ch] text-xs italic text-mute">
        Indicative pricing reflects the unit at the time of publication. Actual figures depend on tower, view, and finish — talk to a broker.
      </p>
    </article>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-mute">{label}</dt>
      <dd className={mono ? 'font-mono text-sm' : 'text-sm'}>{value}</dd>
    </div>
  );
}
