'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';

const NAV = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/listings', label: 'Listings' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/enquiries', label: 'Enquiries' },
  { href: '/dashboard/viewings', label: 'Viewings' },
  { href: '/dashboard/profile', label: 'Profile' },
];

interface Props {
  user: { name: string; email: string; role: string };
  signOutAction: () => Promise<void>;
}

export function DashboardSidebar({ user, signOutAction }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="hidden border-r border-line bg-bone md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      {/* Decorative gradient wash at top of the sidebar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-30"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 0%, var(--gold) 0%, transparent 70%), radial-gradient(60% 60% at 80% 30%, var(--sunset) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative px-8 py-7">
        <Logo />
        <p className="mt-2 inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
          {user.role === 'ADMIN' ? 'Admin' : 'Agent'}
        </p>
      </div>

      <nav className="relative flex-1 px-4 pt-2">
        <ul className="space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.href, n.exact);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-ink text-bone shadow-[0_8px_24px_-12px_rgba(14,17,22,0.3)]'
                      : 'text-mute hover:bg-sand/60 hover:text-ink',
                  )}
                  data-cursor="open"
                >
                  <span
                    className={cn(
                      'block h-1.5 w-1.5 rounded-full transition-colors',
                      active ? 'bg-gold' : 'bg-line group-hover:bg-mute',
                    )}
                  />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative border-t border-line bg-gradient-to-br from-bone to-ivory px-8 py-6">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-mute">{user.email}</p>
        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink"
            data-cursor="sign out"
          >
            Sign out →
          </button>
        </form>
      </div>
    </aside>
  );
}
