'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagneticBaseProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

function useMagnetic(strength = 0.35) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 15, stiffness: 200, mass: 0.4 });
  const sy = useSpring(y, { damping: 15, stiffness: 200, mass: 0.4 });

  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    x.set(dx);
    y.set(dy);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, onMove, onLeave, sx, sy };
}

interface MagneticLinkProps extends MagneticBaseProps {
  href: string;
  cursor?: string;
}

export function MagneticLink({ href, children, className, strength, cursor }: MagneticLinkProps) {
  const { ref, onMove, onLeave, sx, sy } = useMagnetic(strength);

  return (
    <motion.span
      ref={ref as never}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
      data-cursor={cursor}
    >
      <Link href={href} className={cn('inline-flex items-center', className)}>
        {children}
      </Link>
    </motion.span>
  );
}

interface MagneticButtonProps extends MagneticBaseProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  cursor?: string;
  disabled?: boolean;
}

export function MagneticButton({
  type = 'button',
  onClick,
  children,
  className,
  strength,
  cursor,
  disabled,
}: MagneticButtonProps) {
  const { ref, onMove, onLeave, sx, sy } = useMagnetic(strength);

  return (
    <motion.button
      ref={ref as never}
      type={type}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn('inline-flex items-center', className)}
      data-cursor={cursor}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
