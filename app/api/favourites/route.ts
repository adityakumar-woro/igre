import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireAuth } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

const toggleSchema = z.object({
  listingId: z.string().cuid(),
  action: z.enum(['add', 'remove']),
});

// GET — current user's favourites (for /my/favourites)
export async function GET() {
  try {
    const user = await requireAuth();
    const favs = await db.favourite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { include: { area: { select: { name: true } } } },
      },
    });
    return Response.json({ ok: true, data: favs });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST — toggle (action: add | remove)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, 'Invalid input', 'invalid_input');

    const { listingId, action } = parsed.data;

    const listing = await db.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) throw new HttpError(404, 'Listing not found');

    if (action === 'add') {
      await db.favourite.upsert({
        where: { userId_listingId: { userId: user.id, listingId } },
        create: { userId: user.id, listingId },
        update: {},
      });
      db.listing.update({ where: { id: listingId }, data: { favouriteCount: { increment: 1 } } }).catch(() => {});
    } else {
      await db.favourite.deleteMany({ where: { userId: user.id, listingId } });
      db.listing.update({ where: { id: listingId }, data: { favouriteCount: { decrement: 1 } } }).catch(() => {});
    }

    await logAudit({
      userId: user.id,
      action: `favourite.${action}`,
      entityType: 'Listing',
      entityId: listingId,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
