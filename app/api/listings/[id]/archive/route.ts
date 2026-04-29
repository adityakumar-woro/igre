import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// POST /api/listings/[id]/archive — ADMIN only.
// Any status → ARCHIVED.
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['ADMIN']);
    const { id } = await params;

    const listing = await db.listing.findUnique({ where: { id }, select: { id: true } });
    if (!listing) throw new HttpError(404, 'Listing not found');

    await db.listing.update({ where: { id }, data: { status: 'ARCHIVED' } });

    await logAudit({
      userId: user.id,
      action: 'listing.archive',
      entityType: 'Listing',
      entityId: id,
    });

    return Response.json({ ok: true, status: 'ARCHIVED' });
  } catch (err) {
    return errorResponse(err);
  }
}
