import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { listingUpdateSchema } from '@/lib/validations/listing';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface RouteCtx { params: Promise<{ id: string }> }

// PATCH — update an existing listing.
//   MANAGER may edit own DRAFT/PENDING listings (not PUBLISHED — that's an admin call)
//   ADMIN may edit anything
export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const { id } = await params;

    const existing = await db.listing.findUnique({
      where: { id },
      select: { id: true, agentId: true, status: true },
    });
    if (!existing) throw new HttpError(404, 'Listing not found');

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existing.agentId === user.id;

    if (!isAdmin && !isOwner) {
      throw new HttpError(403, 'Forbidden', 'forbidden');
    }
    if (!isAdmin && existing.status === 'PUBLISHED') {
      throw new HttpError(403, 'Published listings can only be edited by an admin', 'requires_admin');
    }

    const body = await req.json();
    const parsed = listingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Manager cannot reassign agent or set status. Admin can.
    const allowedAgentId = isAdmin ? data.agentId : undefined;
    const allowedStatus = isAdmin ? data.status : undefined;

    const updateData: Record<string, unknown> = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.listingType !== undefined && { listingType: data.listingType }),
      ...(data.propertyType !== undefined && { propertyType: data.propertyType }),
      ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
      ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
      ...(data.sqft !== undefined && { sqft: data.sqft }),
      ...(data.parkingSpaces !== undefined && { parkingSpaces: data.parkingSpaces }),
      ...(data.furnished !== undefined && { furnished: data.furnished }),
      ...(data.yearBuilt !== undefined && { yearBuilt: data.yearBuilt }),
      ...(data.price !== undefined && {
        price: data.price,
        pricePerSqft: data.sqft ? Math.round(data.price / Math.max(1, data.sqft)) : undefined,
      }),
      ...(data.serviceCharges !== undefined && { serviceCharges: data.serviceCharges }),
      ...(data.paymentPlan !== undefined && { paymentPlan: data.paymentPlan }),
      ...(data.areaId !== undefined && { areaId: data.areaId }),
      ...(data.buildingName !== undefined && { buildingName: data.buildingName }),
      ...(data.floorNumber !== undefined && { floorNumber: data.floorNumber }),
      ...(data.unitNumber !== undefined && { unitNumber: data.unitNumber }),
      ...(data.fullAddress !== undefined && { fullAddress: data.fullAddress }),
      ...(data.features !== undefined && { features: JSON.stringify(data.features) }),
      ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
      ...(data.images !== undefined && { images: JSON.stringify(data.images) }),
      ...(data.floorPlanUrl !== undefined && { floorPlanUrl: data.floorPlanUrl }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.virtualTourUrl !== undefined && { virtualTourUrl: data.virtualTourUrl }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      ...(allowedAgentId && { agentId: allowedAgentId }),
      ...(allowedStatus && { status: allowedStatus }),
    };

    const updated = await db.listing.update({
      where: { id },
      data: updateData,
      select: { id: true, slug: true, reference: true, status: true },
    });

    await logAudit({
      userId: user.id,
      action: 'listing.update',
      entityType: 'Listing',
      entityId: updated.id,
    });

    return Response.json({ ok: true, ...updated });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE — admin only
export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  try {
    const user = await requireRole(['ADMIN']);
    const { id } = await params;

    const existing = await db.listing.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new HttpError(404, 'Listing not found');

    await db.listing.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      action: 'listing.delete',
      entityType: 'Listing',
      entityId: id,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
