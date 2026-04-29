import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { leadUpdateSchema } from '@/lib/validations/lead';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// PATCH — update lead (status changes, notes, follow-up). MANAGER own; ADMIN all.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const { id } = await params;

    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, agentId: true, status: true },
    });
    if (!lead) throw new HttpError(404, 'Lead not found');

    if (user.role !== 'ADMIN' && lead.agentId !== user.id) {
      throw new HttpError(403, 'Forbidden', 'forbidden');
    }

    const body = await req.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Manager cannot reassign agent; admin can.
    const allowedAgentId = user.role === 'ADMIN' ? data.agentId : undefined;

    const updated = await db.lead.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.nextFollowUpAt !== undefined && { nextFollowUpAt: data.nextFollowUpAt }),
        ...(allowedAgentId && { agentId: allowedAgentId }),
      },
      select: { id: true, status: true },
    });

    await logAudit({
      userId: user.id,
      action: 'lead.update',
      entityType: 'Lead',
      entityId: id,
      metadata: { ...(data.status && { status: data.status }) },
    });

    return Response.json({ ok: true, ...updated });
  } catch (err) {
    return errorResponse(err);
  }
}
