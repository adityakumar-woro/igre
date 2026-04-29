import { db } from '@/lib/db';
import { Hero } from '@/components/public/Hero';
import { AreasMarquee } from '@/components/public/AreasMarquee';
import { StatsBlock } from '@/components/public/StatsBlock';
import { RecentListingsStrip } from '@/components/public/RecentListingsStrip';
import { AreaIndex } from '@/components/public/AreaIndex';
import { FeaturedListing } from '@/components/public/FeaturedListing';
import { ProcessSection } from '@/components/public/ProcessSection';
import { AreasGrid } from '@/components/public/AreasGrid';
import { WhyIgre } from '@/components/public/WhyIgre';
import { Testimonials } from '@/components/public/Testimonials';
import { TeamGrid } from '@/components/public/TeamGrid';
import { QuietCTA } from '@/components/public/QuietCTA';
import { safeJsonArray } from '@/lib/utils';

// Hits SQLite at render time — must render dynamically (DB only exists at runtime).
export const dynamic = 'force-dynamic';

function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'IGRE — Real Estate Brokers',
    image: 'https://igre.ae/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Building C3, Office M3',
      addressLocality: 'Abu Dhabi',
      addressCountry: 'AE',
    },
    telephone: '+971581005220',
    email: 'igre.kaiser@gmail.com',
    areaServed: ['Al Saadiyat Island', 'Al Reem Island', 'Yas Island', 'Hudayriyat Island', 'Corniche Road'],
  };
}

export default async function HomePage() {
  // 1. Areas
  const areas = await db.area.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      heroImageUrl: true,
      startingPrice2BhkSale: true,
    },
  });

  // 2. Featured listing — highest-priced PUBLISHED
  const featured = await db.listing.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: [{ price: 'desc' }],
    include: { area: { select: { name: true } } },
  });

  // 3. Recent listings — last 8 published
  const recent = await db.listing.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 8,
    include: { area: { select: { name: true } } },
  });

  // 4. Team
  const team = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] } },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true, name: true, bio: true, phone: true, email: true, role: true, avatarUrl: true,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd()) }}
      />

      {/* 1. Hero — multi-layer WebGL + split-letter motion + rotating word */}
      <Hero />

      {/* 2. Marquee — area names ticker */}
      <AreasMarquee
        items={['Saadiyat', 'Reem', 'Yas', 'Hudayriyat', 'Corniche', 'Yas Bay']}
        variant="dark"
        duration={28}
      />

      {/* 3. Stats block — animated counters */}
      <StatsBlock />

      {/* 4. Recent listings strip — horizontal scroll, drag/snap */}
      {recent.length > 0 && (
        <RecentListingsStrip
          listings={recent.map((l) => ({
            id: l.id,
            slug: l.slug,
            reference: l.reference,
            title: l.title,
            bedrooms: l.bedrooms,
            sqft: l.sqft,
            price: l.price,
            listingType: l.listingType,
            coverImageUrl: l.coverImageUrl,
            area: l.area,
          }))}
        />
      )}

      {/* 5. The Index — typographic table of contents */}
      <AreaIndex areas={areas} />

      {/* 6. Featured listing — editorial pick */}
      {featured && (
        <FeaturedListing
          listing={{
            slug: featured.slug,
            title: featured.title,
            bedrooms: featured.bedrooms,
            sqft: featured.sqft,
            price: featured.price,
            listingType: featured.listingType,
            coverImageUrl: featured.coverImageUrl,
            area: { name: featured.area.name },
            features: safeJsonArray<string>(featured.features),
          }}
        />
      )}

      {/* 7. Process — How we work, four steps */}
      <ProcessSection />

      {/* 8. Areas We Serve — 2-column staggered grid */}
      <AreasGrid areas={areas} />

      {/* 9. Why IGRE — three colored cards */}
      <WhyIgre />

      {/* 10. Testimonials — rotating quotes */}
      <Testimonials />

      {/* 11. The Team — editorial portraits with real photos */}
      <TeamGrid team={team} />

      {/* 12. Marquee — closing flourish */}
      <AreasMarquee
        items={['Saadiyat Island', 'Al Reem', 'Yas Bay', 'Hudayriyat Coast', 'Abu Dhabi Corniche', 'Ferrari World']}
        variant="light"
        duration={36}
      />

      {/* 13. Quiet CTA */}
      <QuietCTA />
    </>
  );
}
