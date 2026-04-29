'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  placeholder?: boolean;
}

/**
 * Image reveal: starts at scale 1.1 + opacity 0, animates to 1/1 over 1200ms
 * once it enters the viewport. CSS-driven (so reduced-motion override works).
 */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  priority,
  placeholder = true,
}: RevealImageProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-in');
            obs.unobserve(el);
          }
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={cn('image-reveal', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
        data-placeholder={placeholder ? 'true' : undefined}
      />
      {/* TODO: replace placeholder with real photography */}
    </div>
  );
}
