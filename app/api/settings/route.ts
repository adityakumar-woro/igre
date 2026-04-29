import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

// SiteSetting is a simple key→value store. We define an allowlist of editable
// keys so admins can't write arbitrary application config.
const ALLOWED_KEYS = [
  'company_name',
  'company_phone',
  'company_email',
  'company_address',
  'company_map_url',
  'rera_license',
  'instagram_url',
  'linkedin_url',
  'whatsapp_number',
  'footer_copyright',
  'listing_disclaimer',
] as const;
type AllowedKey = typeof ALLOWED_KEYS[number];

const updateSchema = z.object({
  values: z.record(z.string(), z.string().max(500)),
});

// GET /api/settings — ADMIN only.
export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const rows = await db.siteSetting.findMany();
    const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return Response.json({ ok: true, values });
  } catch (err) {
    return errorResponse(err);
  }
}

// PATCH /api/settings — ADMIN only. Accepts { values: { key: value } } and
// upserts each key. Unknown keys are ignored.
export async function PATCH(req: NextRequest) {
  try {
    const me = await requireRole(['ADMIN']);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const writes: Array<Promise<unknown>> = [];
    const accepted: AllowedKey[] = [];
    for (const [key, value] of Object.entries(parsed.data.values)) {
      if (!ALLOWED_KEYS.includes(key as AllowedKey)) continue;
      accepted.push(key as AllowedKey);
      writes.push(
        db.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      );
    }
    await Promise.all(writes);

    await logAudit({
      userId: me.id,
      action: 'settings.update',
      entityType: 'SiteSetting',
      metadata: { keys: accepted },
    });

    return Response.json({ ok: true, updated: accepted });
  } catch (err) {
    return errorResponse(err);
  }
}
