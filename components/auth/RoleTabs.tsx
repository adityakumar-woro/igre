'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Role = 'admin' | 'manager' | 'user';

interface Props {
  active: Role;
  onChange: (role: Role) => void;
}

const ROLES: Array<{ id: Role; label: string; sub: string; tone: string; ring: string; }> = [
  { id: 'admin',   label: 'Admin',   sub: 'Full system access',                tone: 'from-gold to-amber',     ring: 'border-gold' },
  { id: 'manager', label: 'Agent',   sub: 'Listings, leads, viewings',         tone: 'from-gulf to-tide',      ring: 'border-gulf' },
  { id: 'user',    label: 'Client',  sub: 'Favourites, enquiries',             tone: 'from-sunset to-rose',    ring: 'border-sunset' },
];

export function RoleTabs({ active, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ROLES.map((r) => {
        const isActive = active === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onChange(r.id)}
            data-cursor={r.id}
            aria-pressed={isActive}
            className={cn(
              'group relative overflow-hidden border bg-bone/70 px-4 py-5 text-left backdrop-blur-sm transition-colors',
              isActive ? r.ring : 'border-line hover:border-ink/40',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="role-bg"
                className={cn('absolute inset-0 -z-10 bg-gradient-to-br opacity-15', r.tone)}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="block text-[11px] uppercase tracking-[0.22em] text-mute">
              I&apos;m a
            </span>
            <span className={cn(
              'mt-2 block font-display text-2xl tracking-editorial transition-colors',
              isActive ? 'text-ink' : 'text-ink/70 group-hover:text-ink',
            )}>
              {r.label}
            </span>
            <span className="mt-1 block text-[11px] text-mute">{r.sub}</span>
            {isActive && (
              <motion.span
                layoutId="role-dot"
                className="absolute right-3 top-3 block h-2 w-2 rounded-full bg-gold"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
