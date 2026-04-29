'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function FavouriteToggle({ listingId, initial }: { listingId: string; initial: boolean }) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();
  const { data: session } = useSession();
  const router = useRouter();

  const onClick = () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !active;
    setActive(next);
    start(async () => {
      try {
        await fetch('/api/favourites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId, action: next ? 'add' : 'remove' }),
        });
      } catch {
        // revert on failure
        setActive(!next);
      }
    });
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={pending}
      data-cursor={active ? 'unsave' : 'save'}
      whileTap={{ scale: 1.4 }}
      transition={{ type: 'spring', stiffness: 600, damping: 12 }}
      aria-label={active ? 'Remove from favourites' : 'Save to favourites'}
      aria-pressed={active}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-sand"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s-7.5-4.5-9.5-9.5C1 8 3 5 6 5c2 0 3.5 1 6 3 2.5-2 4-3 6-3 3 0 5 3 3.5 6.5C19.5 16.5 12 21 12 21z" />
      </svg>
    </motion.button>
  );
}
