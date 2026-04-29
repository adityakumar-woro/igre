import { NextRequest } from 'next/server';
import { saveUpload } from '@/lib/upload';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

// POST /api/uploads — multipart/form-data with `file` field.
// MANAGER+ only. Stores into /public/uploads/. TODO: swap to S3/R2 in prod.
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN']);

    const form = await req.formData().catch(() => null);
    if (!form) throw new HttpError(400, 'Expected multipart/form-data', 'invalid_input');

    const file = form.get('file');
    if (!(file instanceof File)) {
      throw new HttpError(400, 'Missing file', 'invalid_input');
    }

    const result = await saveUpload(file);

    await logAudit({
      userId: user.id,
      action: 'upload.create',
      entityType: 'Upload',
      metadata: { url: result.url, size: result.size, mime: result.mime },
    });

    return Response.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && !(err as { status?: number }).status) {
      // saveUpload's plain Errors (size/MIME) → 400
      return Response.json({ error: { code: 'invalid_file', message: err.message } }, { status: 400 });
    }
    return errorResponse(err);
  }
}
