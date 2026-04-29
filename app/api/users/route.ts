import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { errorResponse, HttpError, requireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  bio: z.string().max(800).optional(),
  initialPassword: z.string().min(10).max(100).optional(),
  forcePasswordChange: z.boolean().default(true),
});

// GET /api/users — ADMIN only. Filter by role/q.
export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN']);
    const sp = req.nextUrl.searchParams;
    const role = sp.get('role') ?? undefined;
    const q = sp.get('q') ?? undefined;

    const where = {
      ...(role && ['ADMIN', 'MANAGER', 'USER'].includes(role) && { role }),
      ...(q && {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      }),
    };

    const users = await db.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: {
        id: true, email: true, phone: true, name: true, role: true,
        avatarUrl: true, forcePasswordChange: true, createdAt: true, lastLoginAt: true,
        _count: { select: { listings: true, leads: true } },
      },
    });

    return Response.json({ ok: true, data: users });
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/users — ADMIN only. Creates a user with an initial password
// (defaults to a random one — admin shows it once and copies it).
export async function POST(req: NextRequest) {
  try {
    const me = await requireRole(['ADMIN']);
    const body = await req.json();

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const existing = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (existing) throw new HttpError(409, 'An account with this email already exists', 'email_taken');

    // Generate a random password if none provided
    const initialPassword = data.initialPassword ?? generateTempPassword();
    const passwordHash = await bcrypt.hash(initialPassword, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        bio: data.bio,
        passwordHash,
        forcePasswordChange: data.forcePasswordChange,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit({
      userId: me.id,
      action: 'user.create',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });

    // Return the temp password ONCE for the admin to copy/share
    return Response.json({ ok: true, user, initialPassword });
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
  // crypto.getRandomValues works in modern Node 20+ and Edge.
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
  // Guarantee at least one number and one letter
  if (!/[0-9]/.test(out)) out = '7' + out.slice(1);
  if (!/[A-Za-z]/.test(out)) out = 'A' + out.slice(1);
  return out;
}
