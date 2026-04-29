import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, requireAuth } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(20).optional(),
  bio: z.string().max(800).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function GET() {
  try {
    const u = await requireAuth();
    const me = await db.user.findUnique({
      where: { id: u.id },
      select: { id: true, email: true, name: true, phone: true, bio: true, avatarUrl: true, role: true, createdAt: true },
    });
    return Response.json({ ok: true, data: me });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const u = await requireAuth();
    const body = await req.json();
    const parsed = updateMeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const updated = await db.user.update({
      where: { id: u.id },
      data: parsed.data,
      select: { id: true, email: true, name: true, phone: true, bio: true, avatarUrl: true },
    });

    await logAudit({
      userId: u.id,
      action: 'user.update_self',
      entityType: 'User',
      entityId: u.id,
    });

    return Response.json({ ok: true, data: updated });
  } catch (err) {
    return errorResponse(err);
  }
}
