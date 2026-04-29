import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ListingForm } from '@/components/dashboard/ListingForm';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { safeJsonArray } from '@/lib/utils';

export const metadata = { title: 'Edit listing', robots: { index: false } };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditListingPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const isAdmin = session!.user.role === 'ADMIN';
  const { id } = await params;
  const { saved } = await searchParams;

  const listing = await db.listing.findUnique({
    where: { id },
    include: { agent: { select: { id: true, name: true } } },
  });
  if (!listing) notFound();

  // RBAC: admin always; otherwise must own
  if (!isAdmin && listing.agentId !== session!.user.id) {
    redirect('/403');
  }

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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Edit listing</p>
          <p className="mt-2 font-mono text-xs text-mute">{listing.reference}</p>
          <h1 className="mt-2 max-w-[28ch] font-display text-3xl leading-[1.1] tracking-editorial md:text-4xl">
            {listing.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={listing.status} />
          {listing.status === 'PUBLISHED' && (
            <Link
              href={`/listings/${listing.slug}`}
              target="_blank"
              className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink"
              data-cursor="open"
            >
              View live ↗
            </Link>
          )}
        </div>
      </div>

      {saved === '1' && (
        <div className="border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          ✓ Saved.
        </div>
      )}

      <ListingForm
        mode="edit"
        listingId={listing.id}
        areas={areas}
        agents={agents}
        isAdmin={isAdmin}
        ownerId={session!.user.id}
        initialValues={{
          title: listing.title,
          description: listing.description,
          listingType: listing.listingType as 'SALE' | 'RENT' | 'LEASE',
          propertyType: listing.propertyType as 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'PENTHOUSE' | 'STUDIO' | 'OFFPLAN',
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          sqft: listing.sqft,
          parkingSpaces: listing.parkingSpaces,
          furnished: listing.furnished,
          yearBuilt: listing.yearBuilt ?? undefined,
          price: listing.price,
          serviceCharges: listing.serviceCharges ?? undefined,
          paymentPlan: listing.paymentPlan ?? undefined,
          areaId: listing.areaId,
          buildingName: listing.buildingName ?? undefined,
          floorNumber: listing.floorNumber ?? undefined,
          unitNumber: listing.unitNumber ?? undefined,
          fullAddress: listing.fullAddress,
          features: safeJsonArray<string>(listing.features),
          images: safeJsonArray<string>(listing.images),
          coverImageUrl: listing.coverImageUrl,
          agentId: listing.agentId,
          status: listing.status,
        }}
      />
    </div>
  );
}
