'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';

interface NavItem { href: string; label: string; exact?: boolean; group?: string }

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview', exact: true },

  // Listings
  { href: '/admin/listings/pending', label: 'Approval queue', group: 'Listings' },
  { href: '/admin/listings', label: 'All listings' },
  { href: '/admin/listings/new', label: 'Add listing' },

  // Pipeline
  { href: '/dashboard/leads', label: 'All leads', group: 'Pipeline' },
  { href: '/dashboard/enquiries', label: 'All enquiries' },
  { href: '/dashboard/viewings', label: 'All viewings' },

  // Content
  { href: '/admin/areas', label: 'Areas', group: 'Content' },
  { href: '/admin/users', label: 'Users' },

  // System
  { href: '/admin/audit-log', label: 'Audit log', group: 'System' },
  { href: '/admin/settings', label: 'Settings' },
];

interface Props {
  user: { name: string; email: string };
  signOutAction: () => Promise<void>;
}

export function AdminSidebar({ user, signOutAction }: Props) {
  const pathname = usePathname();

  // Build groups for rendering
  const groups: Array<{ heading: string | null; items: NavItem[] }> = [];
  for (const n of NAV) {
    if (n.group || groups.length === 0) {
      groups.push({ heading: n.group ?? null, items: [n] });
    } else {
      groups[groups.length - 1].items.push(n);
    }
  }

  const isActive = (n: NavItem) => {
    // Special-case the pending queue: highlight only when exactly /admin/listings/pending
    if (n.href === '/admin/listings/pending') return pathname === '/admin/listings/pending';
    if (n.exact) return pathname === n.href;
    return pathname === n.href || pathname.startsWith(n.href + '/');
  };

  return (
    <aside className="hidden border-r border-line bg-bone md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      {/* Decorative gold→gulf wash on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-30"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 0%, var(--gold) 0%, transparent 70%), radial-gradient(60% 60% at 80% 30%, var(--gulf) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative px-8 py-7">
        <Logo />
        <p className="mt-2 inline-block rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
          Admin
        </p>
      </div>

      <nav className="relative flex-1 space-y-6 overflow-y-auto px-4 pb-6">
        {groups.map((g, i) => (
          <div key={i}>
            {g.heading && (
              <p className="mb-2 px-4 font-mono text-[10px] uppercase tracking-[0.28em] text-mute">
                {g.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((n) => {
                const active = isActive(n);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className={cn(
                        'group relative flex items-center gap-3 px-4 py-2 text-sm transition-colors',
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
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-8 py-6">
        <p className="truncate text-sm">{user.name}</p>
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
