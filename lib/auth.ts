import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db';
import type { Role } from './types';

// Augment Auth.js types so `session.user.role` is type-safe.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      forcePasswordChange: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    forcePasswordChange: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    forcePasswordChange: boolean;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const nextAuth = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, // 30 days
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        // DEMO_MODE — accept any input. Whatever's typed in the form
        // (or even garbage), the user is logged in as the admin. The login
        // form, button, and role-based redirect all keep working — only
        // the password check is skipped.
        if (process.env.DEMO_MODE === '1') {
          const adminUser = await db.user.findFirst({
            where: { role: 'ADMIN' },
            orderBy: { createdAt: 'asc' },
          });
          if (adminUser) {
            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              image: adminUser.avatarUrl ?? undefined,
              role: adminUser.role as Role,
              forcePasswordChange: false,
            };
          }
          // No admin in DB — fall through to normal flow.
        }

        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        // best-effort lastLoginAt update
        db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {});

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? undefined,
          role: user.role as Role,
          forcePasswordChange: user.forcePasswordChange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.forcePasswordChange = user.forcePasswordChange;
      }
      // Allow client-side `update()` to refresh the flag after a password change
      if (trigger === 'update' && session?.forcePasswordChange === false) {
        token.forcePasswordChange = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.forcePasswordChange = token.forcePasswordChange;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;
const realAuth = nextAuth.auth;

/**
 * `auth()` — usually delegates to Auth.js's session lookup.
 *
 * When `DEMO_MODE=1` is set, this short-circuits and returns a fake-but-real
 * session backed by the admin user from the DB. That bypasses the login
 * screen entirely so /admin, /dashboard, and /my/* all open without
 * authenticating. **NEVER ship to production with DEMO_MODE on.**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function auth(...args: any[]): Promise<any> {
  if (process.env.DEMO_MODE === '1') {
    try {
      const adminUser = await db.user.findFirst({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'asc' },
      });
      if (adminUser) {
        return {
          user: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            image: adminUser.avatarUrl ?? null,
            role: adminUser.role as Role,
            forcePasswordChange: false,
          },
          expires: new Date(Date.now() + 86400000).toISOString(),
        };
      }
    } catch {
      // fall through to real auth on any DB error
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (realAuth as any)(...args);
}
