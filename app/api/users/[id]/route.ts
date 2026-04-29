import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(7).max(20).nullable().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  bio: z.string().max(800).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  forcePasswordChange: z.boolean().optional(),
});

// PATCH /api/users/[id] — ADMIN only.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireRole(['ADMIN']);
    const { id } = await params;

    const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true, email: true } });
    if (!target) throw new HttpError(404, 'User not found');

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Don't allow demoting the last ADMIN
    if (data.role && data.role !== 'ADMIN' && target.role === 'ADMIN') {
      const adminCount = await db.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new HttpError(409, 'Cannot demote the last admin', 'last_admin');
      }
    }

    // If email changes, check uniqueness
    if (data.email && data.email !== target.email) {
      const existing = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
      if (existing && existing.id !== id) throw new HttpError(409, 'Email is taken', 'email_taken');
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit({
      userId: me.id,
      action: 'user.update',
      entityType: 'User',
      entityId: id,
      metadata: { changedRole: data.role ?? null },
    });

    return Response.json({ ok: true, user: updated });
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/users/[id] — ADMIN only. Refuses to delete the last admin.
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireRole(['ADMIN']);
    const { id } = await params;

    if (id === me.id) throw new HttpError(409, 'You cannot delete your own account', 'self_delete');

    const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) throw new HttpError(404, 'User not found');

    if (target.role === 'ADMIN') {
      const adminCount = await db.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) throw new HttpError(409, 'Cannot delete the last admin', 'last_admin');
    }

    // Reassign listings/leads to the deleting admin so they don't orphan.
    await db.listing.updateMany({ where: { agentId: id }, data: { agentId: me.id } });
    await db.lead.updateMany({ where: { agentId: id }, data: { agentId: me.id } });

    await db.user.delete({ where: { id } });

    await logAudit({
      userId: me.id,
      action: 'user.delete',
      entityType: 'User',
      entityId: id,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
