import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { CustomCursor } from '@/components/motion/CustomCursor';
import { SessionProvider } from '@/components/shared/SessionProvider';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT'],
  // No `weight` here — Fraunces is variable, weight is `variable` by default
  // which lets us use any weight via font-weight CSS without re-fetching.
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-plex-arabic',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://igre.ae'),
  title: {
    default: 'IGRE — Property in Abu Dhabi, told properly.',
    template: '%s | IGRE',
  },
  description:
    'Sales, leasing, and brokerage on Abu Dhabi\'s islands. Saadiyat, Reem, Yas, Hudayriyat, Corniche.',
  openGraph: {
    title: 'IGRE — Real Estate Brokers, Abu Dhabi',
    description: 'Property in Abu Dhabi, told properly.',
    locale: 'en_AE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#F4F1EA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexArabic.variable}`}>
      <body className="bg-bone text-ink has-custom-cursor">
        <SessionProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <CustomCursor />
        </SessionProvider>
      </body>
    </html>
  );
}
