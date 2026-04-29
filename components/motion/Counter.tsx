'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface Props {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Counts from 0 to `to` once the element enters the viewport.
 * Uses requestAnimationFrame with eased progression.
 */
export function Counter({
  to,
  durationMs = 1800,
  prefix = '',
  suffix = '',
  format,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, durationMs]);

  const display = format ? format(value) : value.toLocaleString('en-AE');

  return (
    <span ref={ref} className={`tnum ${className ?? ''}`}>
      {prefix}{display}{suffix}
    </span>
  );
}
