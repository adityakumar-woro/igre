import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().max(500).optional(),
  preferredDate: z.coerce.date().optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

// PATCH /api/viewing-requests/[id] — MANAGER/ADMIN only.
// MANAGER may only act on viewings for their own listings (or, in v1, any —
// the assignment to specific agents lands with the admin assign feature).
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const { id } = await params;

    const viewing = await db.viewingRequest.findUnique({
      where: { id },
      include: { listing: { select: { agentId: true } } },
    });
    if (!viewing) throw new HttpError(404, 'Not found');

    if (user.role !== 'ADMIN' && viewing.listing.agentId !== user.id) {
      throw new HttpError(403, 'Forbidden', 'forbidden');
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const updated = await db.viewingRequest.update({
      where: { id },
      data: parsed.data,
      select: { id: true, status: true },
    });

    await logAudit({
      userId: user.id,
      action: 'viewing.update',
      entityType: 'ViewingRequest',
      entityId: id,
      metadata: { status: parsed.data.status },
    });

    return Response.json({ ok: true, ...updated });
  } catch (err) {
    return errorResponse(err);
  }
}
