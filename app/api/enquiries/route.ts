import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { enquirySchema } from '@/lib/validations/enquiry';
import { rateLimit } from '@/lib/ratelimit';
import { errorResponse, HttpError, getCurrentUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`enq:${ip}`);
    if (!rl.ok) throw new HttpError(429, 'Too many requests. Please try again shortly.', 'rate_limited');

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const me = await getCurrentUser();

    // If a listingId was supplied, verify it exists and bump the enquiry counter.
    if (data.listingId) {
      const listing = await db.listing.findUnique({ where: { id: data.listingId }, select: { id: true } });
      if (!listing) throw new HttpError(400, 'Listing not found', 'invalid_listing');
    }

    const enquiry = await db.enquiry.create({
      data: {
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        budget: data.budget,
        preferredArea: data.preferredArea,
        listingId: data.listingId ?? null,
        userId: me?.id ?? null,
        source: 'website',
      },
    });

    if (data.listingId) {
      db.listing
        .update({ where: { id: data.listingId }, data: { enquiryCount: { increment: 1 } } })
        .catch(() => {});
    }

    await logAudit({
      userId: me?.id ?? null,
      action: 'enquiry.create',
      entityType: 'Enquiry',
      entityId: enquiry.id,
      metadata: { type: data.type, listingId: data.listingId ?? null },
    });

    // TODO: notify the assigned agent via email (lib/email.ts) once production routing is decided.

    return Response.json({ ok: true, id: enquiry.id });
  } catch (err) {
    return errorResponse(err);
  }
}
