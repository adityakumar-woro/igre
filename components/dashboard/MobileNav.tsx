'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  return (
    <>
      <header className="flex items-center justify-between border-b border-line bg-bone px-6 py-4 md:hidden">
        <Logo />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
        >
          <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', open && 'translate-y-[3px] rotate-45')} />
          <span className={cn('block h-px w-5 bg-ink transition-transform duration-300', open && '-translate-y-[3px] -rotate-45')} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 top-[57px] z-40 bg-bone md:hidden">
          <nav className="flex flex-col px-6 py-8">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'border-b border-line py-4 font-display text-2xl tracking-editorial',
                  current?.href === n.href && 'text-gold',
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-6">
            <p className="text-sm">{user.name}</p>
            <p className="text-xs text-mute">{user.email}</p>
            <form action={signOutAction} className="mt-6">
              <button type="submit" className="text-xs uppercase tracking-[0.18em] text-mute hover:text-ink">
                Sign out →
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
