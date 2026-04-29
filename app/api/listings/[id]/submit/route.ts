import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// POST /api/listings/[id]/submit
//   MANAGER: own DRAFT listing → PENDING (admin then publishes)
//   ADMIN: also fine
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, agentId: true, status: true },
    });
    if (!listing) throw new HttpError(404, 'Listing not found');

    if (user.role !== 'ADMIN' && listing.agentId !== user.id) {
      throw new HttpError(403, 'Forbidden', 'forbidden');
    }
    if (listing.status !== 'DRAFT') {
      throw new HttpError(409, `Can only submit a DRAFT listing (current: ${listing.status})`, 'invalid_state');
    }

    await db.listing.update({ where: { id }, data: { status: 'PENDING' } });

    await logAudit({
      userId: user.id,
      action: 'listing.submit',
      entityType: 'Listing',
      entityId: id,
    });

    return Response.json({ ok: true, status: 'PENDING' });
  } catch (err) {
    return errorResponse(err);
  }
}
