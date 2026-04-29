import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { changePasswordSchema } from '@/lib/validations/auth';
import { errorResponse, HttpError, requireAuth } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new HttpError(404, 'User not found');

    const ok = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!ok) throw new HttpError(400, 'Current password is incorrect', 'wrong_password');

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, forcePasswordChange: false },
    });

    await logAudit({
      userId: user.id,
      action: 'user.change_password',
      entityType: 'User',
      entityId: user.id,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
