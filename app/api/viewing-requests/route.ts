import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { viewingRequestSchema } from '@/lib/validations/enquiry';
import { rateLimit } from '@/lib/ratelimit';
import { errorResponse, HttpError, getCurrentUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`viewing:${ip}`);
    if (!rl.ok) throw new HttpError(429, 'Too many requests', 'rate_limited');

    const body = await req.json();
    const parsed = viewingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const me = await getCurrentUser();

    const listing = await db.listing.findUnique({
      where: { id: parsed.data.listingId },
      select: { id: true },
    });
    if (!listing) throw new HttpError(400, 'Listing not found', 'invalid_listing');

    const created = await db.viewingRequest.create({
      data: {
        ...parsed.data,
        userId: me?.id ?? null,
        status: 'PENDING',
      },
    });

    await logAudit({
      userId: me?.id ?? null,
      action: 'viewing.create',
      entityType: 'ViewingRequest',
      entityId: created.id,
    });

    return Response.json({ ok: true, id: created.id });
  } catch (err) {
    return errorResponse(err);
  }
}
