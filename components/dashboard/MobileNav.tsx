'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/listings', label: 'Listings' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/enquiries', label: 'Enquiries' },
  { href: '/dashboard/viewings', label: 'Viewings' },
  { href: '/dashboard/profile', label: 'Profile' },
];

interface Props {
  user: { name: string; email: string };
  signOutAction: () => Promise<void>;
}

export function MobileNav({ user, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV.find((n) =>
    n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(n.href + '/'),
  );

  // Body scroll lock + close on route change
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bone px-6 py-4 md:hidden">
        <Logo />
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

      {/* Drawer — covers full viewport, fully opaque, scroll-locked */}
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 overflow-y-auto bg-bone transition-opacity duration-300 ease-editorial md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="container-editorial flex flex-col pb-16 pt-24">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-mute">
            Dashboard
          </p>
          <nav className="flex flex-col">
            {NAV.map((n) => {
              const active = current?.href === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between border-b border-line py-5 font-display text-3xl tracking-editorial transition-colors',
                    active ? 'text-gold' : 'text-ink hover:text-gold',
                  )}
                >
                  <span>{n.label}</span>
                  {active && <span className="text-base">●</span>}
                </Link>
              );
            })}
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
