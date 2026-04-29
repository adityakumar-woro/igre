import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import { rateLimit } from '@/lib/ratelimit';
import { errorResponse, HttpError } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`register:${ip}`);
    if (!rl.ok) throw new HttpError(429, 'Too many requests', 'rate_limited');

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'invalid_input', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    const { name, email, phone, password } = parsed.data;
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists', 'email_taken');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'USER',
        forcePasswordChange: false,
      },
      select: { id: true, email: true, name: true },
    });

    await logAudit({
      userId: user.id,
      action: 'user.register',
      entityType: 'User',
      entityId: user.id,
    });

    return Response.json({ ok: true, user });
  } catch (err) {
    return errorResponse(err);
  }
}
