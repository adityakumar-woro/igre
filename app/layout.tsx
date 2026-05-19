import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { SessionProvider } from '@/components/shared/SessionProvider';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://igre.ae'),
  title: {
    default: 'IGRE — Property in Abu Dhabi, told properly.',
    template: '%s | IGRE',
  },
  description:
    'Sales, rentals, leasing, and brokerage across Abu Dhabi islands, mainland communities, and city neighbourhoods.',
  openGraph: {
    title: 'IGRE — Ideal Greenland Real Estate LLC, Abu Dhabi',
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
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-bone text-ink">
        <SessionProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </SessionProvider>
      </body>
    </html>
  );
}
