'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/listings/pending', label: 'Approval queue' },
  { href: '/admin/listings', label: 'All listings' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/areas', label: 'Areas' },
  { href: '/admin/audit-log', label: 'Audit log' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/dashboard/leads', label: 'Leads' },
  { href: '/dashboard/enquiries', label: 'Enquiries' },
  { href: '/dashboard/viewings', label: 'Viewings' },
];

interface Props {
  user: { name: string; email: string };
  signOutAction: () => Promise<void>;
}

export function AdminMobileNav({ user, signOutAction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-line bg-bone px-6 py-4 md:hidden">
        <div>
          <Logo />
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-gold">Admin</p>
        </div>
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
        <div className="fixed inset-0 top-[73px] z-40 overflow-y-auto bg-bone md:hidden">
          <nav className="flex flex-col px-6 py-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-2xl tracking-editorial"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-6 pb-12">
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
