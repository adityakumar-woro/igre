import { auth } from './auth';
import type { Role } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = 'http_error') {
    super(message);
  }
}

/**
 * Server-side guard for API routes & server actions.
 * Throws HttpError(401|403). Catch and translate to a JSON Response in route handlers.
 */
export async function requireRole(roles: Role[]) {
  const session = await auth();
  if (!session?.user) throw new HttpError(401, 'Authentication required', 'unauthorized');
  if (!roles.includes(session.user.role)) throw new HttpError(403, 'Insufficient permissions', 'forbidden');
  return session.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new HttpError(401, 'Authentication required', 'unauthorized');
  return session.user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Translate a thrown HttpError into a JSON Response. */
export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  console.error(err);
  return Response.json(
    { error: { code: 'internal', message: 'Something went wrong' } },
    { status: 500 },
  );
}
