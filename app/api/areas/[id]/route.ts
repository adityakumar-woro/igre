import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

const updateAreaSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  tagline: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(4000).optional(),
  heroImageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  startingPrice2BhkSale: z.coerce.number().int().nonnegative().nullable().optional(),
  startingPrice3BhkSale: z.coerce.number().int().nonnegative().nullable().optional(),
  startingPriceVillaSale: z.coerce.number().int().nonnegative().nullable().optional(),
  startingPrice2BhkRent: z.coerce.number().int().nonnegative().nullable().optional(),
  startingPrice3BhkRent: z.coerce.number().int().nonnegative().nullable().optional(),
  startingPriceVillaRent: z.coerce.number().int().nonnegative().nullable().optional(),
  freehold: z.boolean().optional(),
  distanceToAirportKm: z.coerce.number().nonnegative().nullable().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

// PATCH /api/areas/[id] — ADMIN only.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireRole(['ADMIN']);
    const { id } = await params;

    const area = await db.area.findUnique({ where: { id }, select: { id: true } });
    if (!area) throw new HttpError(404, 'Area not found');

    const body = await req.json();
    const parsed = updateAreaSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { images, ...rest } = parsed.data;
    const updated = await db.area.update({
      where: { id },
      data: {
        ...rest,
        ...(images && { images: JSON.stringify(images) }),
      },
      select: { id: true, slug: true, name: true },
    });

    await logAudit({
      userId: me.id,
      action: 'area.update',
      entityType: 'Area',
      entityId: id,
    });

    return Response.json({ ok: true, area: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
