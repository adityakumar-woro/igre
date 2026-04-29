import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className, mark = false, light = false }: { className?: string; mark?: boolean; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="IGRE — Real Estate Brokers, Abu Dhabi"
      className={cn('inline-flex items-center gap-3', className)}
      data-cursor="home"
    >
      <span className={cn(
        'relative inline-block h-9 w-9 overflow-hidden rounded-full',
        light ? 'bg-bone/10' : 'bg-ink/5',
      )}>
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          sizes="36px"
          className="object-cover"
          priority
        />
      </span>
      {!mark && (
        <span className="hidden flex-col leading-none md:inline-flex">
          <span className={cn(
            'font-display text-xl tracking-editorial leading-none',
            light ? 'text-bone' : 'text-ink',
          )}>
            IGRE
          </span>
          <span className={cn(
            'mt-0.5 text-[9px] uppercase tracking-[0.22em]',
            light ? 'text-bone/60' : 'text-mute',
          )}>
            Real Estate · Abu Dhabi
          </span>
        </span>
      )}
    </Link>
  );
}
