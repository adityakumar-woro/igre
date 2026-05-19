'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagneticBaseProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

interface MagneticLinkProps extends MagneticBaseProps {
  href: string;
  cursor?: string;
}

export function MagneticLink({ href, children, className }: MagneticLinkProps) {
  return (
    <span className="inline-block">
      <Link href={href} className={cn('inline-flex items-center', className)}>
        {children}
      </Link>
    </span>
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
  disabled,
}: MagneticButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn('inline-flex items-center', className)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
