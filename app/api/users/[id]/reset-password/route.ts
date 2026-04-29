import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

interface Ctx { params: Promise<{ id: string }> }

// POST /api/users/[id]/reset-password — ADMIN only.
// Generates a fresh temp password, sets forcePasswordChange=true, returns the
// new password ONCE for the admin to copy/share. Does not email it (yet — TODO
// when the email system is hooked up properly).
export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const me = await requireRole(['ADMIN']);
    const { id } = await params;

    const target = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) throw new HttpError(404, 'User not found');

    const newPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id },
      data: { passwordHash, forcePasswordChange: true },
    });

    await logAudit({
      userId: me.id,
      action: 'user.reset_password',
      entityType: 'User',
      entityId: id,
    });

    return Response.json({ ok: true, newPassword });
  } catch (err) {
    return errorResponse(err);
  }
}

function generateTempPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const nums = '23456789';
  const alphabet = upper + lower + nums;
  let out = '';
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
  if (!/[0-9]/.test(out)) out = '7' + out.slice(1);
  if (!/[A-Za-z]/.test(out)) out = 'A' + out.slice(1);
  return out;
}
