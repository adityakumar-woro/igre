'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

interface NavItem { href: string; label: string; group?: string }

const NAV: NavItem[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/listings/pending', label: 'Approval queue', group: 'Listings' },
  { href: '/admin/listings', label: 'All listings' },
  { href: '/admin/leads', label: 'Leads', group: 'Pipeline' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/viewings', label: 'Viewings' },
  { href: '/admin/areas', label: 'Areas', group: 'Content' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/audit-log', label: 'Audit log', group: 'System' },
  { href: '/admin/settings', label: 'Settings' },
];

interface Props {
  user: { name: string; email: string };
  signOutAction: () => Promise<void>;
}

export function AdminMobileNav({ user, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Body scroll lock + close on route change
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Group items for rendering
  const groups: Array<{ heading: string | null; items: NavItem[] }> = [];
  for (const n of NAV) {
    if (n.group || groups.length === 0) {
      groups.push({ heading: n.group ?? null, items: [n] });
    } else {
      groups[groups.length - 1].items.push(n);
    }
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bone px-6 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
            Admin
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="relative z-[60] flex h-9 w-9 flex-col items-center justify-center gap-1.5"
        >
          <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', open && 'translate-y-[3px] rotate-45')} />
          <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', open && '-translate-y-[3px] -rotate-45')} />
        </button>
      </header>

      {/* Drawer — covers full viewport, opaque, scroll-locked */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-bone transition-opacity duration-300 ease-editorial md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="container-editorial flex flex-col pb-16 pt-24">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
            Admin
          </p>

          <nav className="space-y-8">
            {groups.map((g, i) => (
              <div key={i}>
                {g.heading && (
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
                    {g.heading}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {g.items.map((n) => {
                    const active = isActive(n.href);
                    return (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center justify-between border-b border-line py-4 font-display text-2xl tracking-editorial transition-colors',
                            active ? 'text-gold' : 'text-ink hover:text-gold',
                          )}
                        >
                          <span>{n.label}</span>
                          {active && <span className="text-sm">●</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-12 rounded-sm border border-line bg-gradient-to-br from-bone to-ivory p-5">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="mt-1 truncate text-xs text-mute">{user.email}</p>
            <form action={signOutAction} className="mt-5">
              <button type="submit" className="text-[11px] uppercase tracking-[0.18em] text-mute hover:text-ink">
                Sign out →
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
