import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { activityCreateSchema } from '@/lib/validations/lead';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// POST /api/leads/[id]/activities — append an activity to a lead's timeline
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const { id } = await params;

    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, agentId: true },
    });
    if (!lead) throw new HttpError(404, 'Lead not found');

    if (user.role !== 'ADMIN' && lead.agentId !== user.id) {
      throw new HttpError(403, 'Forbidden', 'forbidden');
    }

    const body = await req.json();
    const parsed = activityCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const activity = await db.leadActivity.create({
      data: {
        leadId: id,
        type: parsed.data.type,
        content: parsed.data.content,
        createdById: user.id,
      },
    });

    // Touch the parent lead so updatedAt sorts work
    await db.lead.update({ where: { id }, data: { updatedAt: new Date() } });

    await logAudit({
      userId: user.id,
      action: 'lead.activity',
      entityType: 'Lead',
      entityId: id,
      metadata: { type: parsed.data.type },
    });

    return Response.json({ ok: true, id: activity.id });
  } catch (err) {
    return errorResponse(err);
  }
}
