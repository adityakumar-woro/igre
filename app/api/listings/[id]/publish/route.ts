import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// POST /api/listings/[id]/publish — ADMIN only.
// PENDING or DRAFT → PUBLISHED. Sets publishedAt if first time.
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['ADMIN']);
    const { id } = await params;

    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true, status: true, publishedAt: true },
    });
    if (!listing) throw new HttpError(404, 'Listing not found');

    if (listing.status === 'PUBLISHED') {
      throw new HttpError(409, 'Already published', 'already_published');
    }

    await db.listing.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: listing.publishedAt ?? new Date(),
      },
    });

    await logAudit({
      userId: user.id,
      action: 'listing.publish',
      entityType: 'Listing',
      entityId: id,
    });

    return Response.json({ ok: true, status: 'PUBLISHED' });
  } catch (err) {
    return errorResponse(err);
  }
}
