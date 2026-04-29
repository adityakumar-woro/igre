import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { leadCreateSchema } from '@/lib/validations/lead';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

// GET — list leads (own for MANAGER, all for ADMIN)
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const status = req.nextUrl.searchParams.get('status') ?? undefined;

    const where = {
      ...(user.role === 'ADMIN' ? {} : { agentId: user.id }),
      ...(status && { status }),
    };

    const leads = await db.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: { select: { id: true, slug: true, title: true, reference: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    return Response.json({ ok: true, data: leads });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST — create a lead. Optionally converts an enquiry.
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);
    const body = await req.json();

    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    let agentId = user.id;
    if (user.role === 'ADMIN' && data.agentId) {
      const candidate = await db.user.findUnique({ where: { id: data.agentId }, select: { id: true, role: true } });
      if (!candidate || (candidate.role !== 'MANAGER' && candidate.role !== 'ADMIN')) {
        throw new HttpError(400, 'Invalid agent', 'invalid_agent');
      }
      agentId = candidate.id;
    }

    // If converting from an enquiry, mark enquiry as CONTACTED
    let enquiryConnect: { id: string } | undefined;
    if (data.enquiryId) {
      const enquiry = await db.enquiry.findUnique({ where: { id: data.enquiryId }, select: { id: true, lead: { select: { id: true } } } });
      if (!enquiry) throw new HttpError(400, 'Enquiry not found', 'invalid_enquiry');
      if (enquiry.lead) throw new HttpError(409, 'Already converted', 'already_converted');
      enquiryConnect = { id: enquiry.id };
    }

    const lead = await db.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        budget: data.budget,
        notes: data.notes,
        nextFollowUpAt: data.nextFollowUpAt,
        agentId,
        ...(data.listingId && { listingId: data.listingId }),
        ...(enquiryConnect && { enquiryId: enquiryConnect.id }),
      },
      select: { id: true },
    });

    if (data.enquiryId) {
      await db.enquiry.update({
        where: { id: data.enquiryId },
        data: { status: 'CONTACTED' },
      });
    }

    await logAudit({
      userId: user.id,
      action: 'lead.create',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: { fromEnquiry: data.enquiryId ?? null },
    });

    return Response.json({ ok: true, id: lead.id });
  } catch (err) {
    return errorResponse(err);
  }
}
