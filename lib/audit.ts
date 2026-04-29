import { db } from './db';
import { headers } from 'next/headers';

export interface AuditPayload {
  userId?: string | null;
  action: string;          // e.g. "listing.publish"
  entityType: string;      // e.g. "Listing"
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Best-effort audit log write. Never throws — logs are valuable but should
 * never block the user's request if writing fails.
 */
export async function logAudit(payload: AuditPayload) {
  try {
    const h = await headers();
    const ipAddress =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      null;
    const userAgent = h.get('user-agent') || null;

    await db.auditLog.create({
      data: {
        userId: payload.userId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
