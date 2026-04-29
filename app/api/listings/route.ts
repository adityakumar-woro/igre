import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { listingFiltersSchema, listingCreateSchema } from '@/lib/validations/listing';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { slugify, uniqueSlug } from '@/lib/slugify';
import { nextListingReference } from '@/lib/reference';

// ----------------------------------------------------------------------------
// GET — public listing search
// ----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = listingFiltersSchema.safeParse(sp);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid filters', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const f = parsed.data;

    let areaId: string | undefined;
    if (f.area) {
      const a = await db.area.findUnique({ where: { slug: f.area }, select: { id: true } });
      if (a) areaId = a.id;
    }

    const where = {
      status: 'PUBLISHED' as const,
      ...(f.listingType && { listingType: f.listingType }),
      ...(f.propertyType && { propertyType: f.propertyType }),
      ...(typeof f.bedrooms === 'number' && { bedrooms: { gte: f.bedrooms } }),
      ...(areaId && { areaId }),
      ...(f.q && {
        OR: [
          { title: { contains: f.q } },
          { description: { contains: f.q } },
        ],
      }),
      ...((f.minPrice || f.maxPrice) && {
        price: {
          ...(f.minPrice && { gte: f.minPrice }),
          ...(f.maxPrice && { lte: f.maxPrice }),
        },
      }),
    };

    const orderBy =
      f.sort === 'price_asc' ? { price: 'asc' as const }
      : f.sort === 'price_desc' ? { price: 'desc' as const }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: { area: { select: { name: true, slug: true } } },
        orderBy,
        skip: (f.page - 1) * f.perPage,
        take: f.perPage,
      }),
      db.listing.count({ where }),
    ]);

    return Response.json({
      ok: true,
      data: items,
      pagination: {
        page: f.page,
        perPage: f.perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / f.perPage)),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// ----------------------------------------------------------------------------
// POST — create a new listing (MANAGER+ only). Saves as DRAFT.
// ----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const body = await req.json();

    const parsed = listingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Verify area exists
    const area = await db.area.findUnique({ where: { id: data.areaId }, select: { id: true, slug: true } });
    if (!area) throw new HttpError(400, 'Area not found', 'invalid_area');

    // Determine agent assignment
    let agentId = user.id;
    if (user.role === 'ADMIN' && data.agentId) {
      const candidate = await db.user.findUnique({ where: { id: data.agentId }, select: { id: true, role: true } });
      if (!candidate || (candidate.role !== 'MANAGER' && candidate.role !== 'ADMIN')) {
        throw new HttpError(400, 'Invalid agent', 'invalid_agent');
      }
      agentId = candidate.id;
    }

    // Generate unique slug & reference
    const existingSlugs = await db.listing.findMany({
      where: { slug: { startsWith: slugify(data.title).slice(0, 60) } },
      select: { slug: true },
    });
    const slug = uniqueSlug(data.title, new Set(existingSlugs.map((l) => l.slug)));
    const reference = await nextListingReference(area.slug);

    const created = await db.listing.create({
      data: {
        reference,
        slug,
        title: data.title,
        description: data.description,
        listingType: data.listingType,
        propertyType: data.propertyType,
        status: 'DRAFT',
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqft: data.sqft,
        parkingSpaces: data.parkingSpaces,
        furnished: data.furnished,
        yearBuilt: data.yearBuilt,
        price: data.price,
        priceUnit: 'AED',
        pricePerSqft: Math.round(data.price / Math.max(1, data.sqft)),
        serviceCharges: data.serviceCharges,
        paymentPlan: data.paymentPlan,
        areaId: data.areaId,
        buildingName: data.buildingName,
        floorNumber: data.floorNumber,
        unitNumber: data.unitNumber,
        fullAddress: data.fullAddress,
        features: JSON.stringify(data.features ?? []),
        coverImageUrl: data.coverImageUrl,
        images: JSON.stringify(data.images ?? []),
        floorPlanUrl: data.floorPlanUrl,
        videoUrl: data.videoUrl,
        virtualTourUrl: data.virtualTourUrl,
        agentId,
        metaTitle: data.metaTitle ?? `${data.title} | IGRE`,
        metaDescription: data.metaDescription ?? data.title.slice(0, 160),
      },
      select: { id: true, slug: true, reference: true },
    });

    await logAudit({
      userId: user.id,
      action: 'listing.create',
      entityType: 'Listing',
      entityId: created.id,
      metadata: { reference: created.reference },
    });

    return Response.json({ ok: true, ...created });
  } catch (err) {
    return errorResponse(err);
  }
}
