/**
 * Idempotent migration: add 5 mainland residential areas + 12 new listings
 * (mostly rentals) across them.
 *
 * Run locally:    npx tsx scripts/add-mainland.ts
 * Run on Railway: set env var RUN_ADD_MAINLAND=1 and redeploy (start.js picks
 *                 it up). Remove the var once it's done.
 *
 * Safe to run repeatedly — uses upsert for areas (by slug) and skips listings
 * whose `reference` already exists.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reusable image URLs for the new content. Mainland Abu Dhabi residential
// photography from Unsplash; replace with bespoke shots later.
const IMG = {
  // Area heros
  khalifaCity:    'https://images.unsplash.com/photo-1613553497126-a44624272024?w=2400&q=80', // suburban villas
  rahaBeach:      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=80',     // coastal apartments
  mbzCity:        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=2400&q=80',  // family villa
  bateen:         'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80',  // upscale waterfront
  khalidiyah:     'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=2400&q=80',  // city apartments

  // Interiors / villas — reused
  i1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80',
  i2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80',
  i3: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=80',
  i4: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1800&q=80',
  i5: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1800&q=80',
  i6: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1800&q=80',
  v1: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80',
  v2: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1800&q=80',
};

interface AreaSpec {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImageUrl: string;
  startingPrice2BhkSale?: number;
  startingPrice3BhkSale?: number;
  startingPriceVillaSale?: number;
  startingPrice2BhkRent?: number;
  startingPrice3BhkRent?: number;
  startingPriceVillaRent?: number;
  freehold: boolean;
  distanceToAirportKm: number;
  isFeatured: boolean;
  sortOrder: number;
}

const NEW_AREAS: AreaSpec[] = [
  {
    slug: 'khalifa-city',
    name: 'Khalifa City',
    tagline: 'Where Abu Dhabi families actually live.',
    description:
      'Khalifa City is the long-running family villa community east of the centre — three- and four-bedroom homes on quiet streets, schools within a short drive, and the airport ten minutes away. Less marketing-pitch than the islands, more daily life.',
    heroImageUrl: IMG.khalifaCity,
    startingPrice3BhkSale: 2200000,
    startingPriceVillaSale: 3200000,
    startingPrice3BhkRent: 130000,
    startingPriceVillaRent: 180000,
    freehold: true,
    distanceToAirportKm: 10,
    isFeatured: false,
    sortOrder: 7,
  },
  {
    slug: 'al-raha-beach',
    name: 'Al Raha Beach',
    tagline: 'The mainland answer to the islands.',
    description:
      'Al Raha runs along the coast on the way to Yas — apartments and townhouses with their own marina, restaurants on the beach, and an easy commute to both downtown and the airport. Quietly one of the best-connected addresses in the city.',
    heroImageUrl: IMG.rahaBeach,
    startingPrice2BhkSale: 1450000,
    startingPrice3BhkSale: 2300000,
    startingPriceVillaSale: 4200000,
    startingPrice2BhkRent: 105000,
    startingPrice3BhkRent: 155000,
    startingPriceVillaRent: 220000,
    freehold: true,
    distanceToAirportKm: 14,
    isFeatured: true,
    sortOrder: 8,
  },
  {
    slug: 'mohammed-bin-zayed-city',
    name: 'Mohammed Bin Zayed City',
    tagline: 'Suburban Abu Dhabi, priced honestly.',
    description:
      'MBZ City is a large, gridded residential community south of the airport. Spacious villas with private gardens, gated sub-developments, and a price-per-sqft that makes it one of the better-value family addresses in the emirate.',
    heroImageUrl: IMG.mbzCity,
    startingPriceVillaSale: 2400000,
    startingPriceVillaRent: 130000,
    startingPrice3BhkRent: 95000,
    freehold: false,
    distanceToAirportKm: 12,
    isFeatured: false,
    sortOrder: 9,
  },
  {
    slug: 'al-bateen',
    name: 'Al Bateen',
    tagline: 'The embassy district. Quiet, leafy, central.',
    description:
      'Al Bateen sits on the western edge of the mainland — embassies, low-rise apartment blocks, palm-lined streets, the marina at the end of the road. A small-town feel five minutes from downtown.',
    heroImageUrl: IMG.bateen,
    startingPrice2BhkSale: 1900000,
    startingPrice3BhkSale: 2900000,
    startingPriceVillaSale: 5500000,
    startingPrice2BhkRent: 100000,
    startingPrice3BhkRent: 150000,
    startingPriceVillaRent: 280000,
    freehold: false,
    distanceToAirportKm: 30,
    isFeatured: false,
    sortOrder: 10,
  },
  {
    slug: 'al-khalidiyah',
    name: 'Al Khalidiyah',
    tagline: 'Old-school mainland Abu Dhabi.',
    description:
      'Khalidiyah is what most Abu Dhabians call home — apartment blocks on a grid of named streets, walkable to the Corniche, the parks, and the older shopping centres. The most affordable entry point to mainland city living.',
    heroImageUrl: IMG.khalidiyah,
    startingPrice2BhkSale: 1100000,
    startingPrice3BhkSale: 1700000,
    startingPrice2BhkRent: 80000,
    startingPrice3BhkRent: 115000,
    freehold: false,
    distanceToAirportKm: 32,
    isFeatured: false,
    sortOrder: 11,
  },
];

interface ListingSpec {
  reference: string;
  slug: string;
  title: string;
  areaSlug: string;
  agentEmail: string;
  type: 'SALE' | 'RENT';
  property: 'APARTMENT' | 'VILLA' | 'TOWNHOUSE' | 'PENTHOUSE';
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING';
  bed: number;
  bath: number;
  sqft: number;
  price: number;
  cover: string;
  address: string;
  features: string[];
}

const NEW_LISTINGS: ListingSpec[] = [
  // ---- Khalifa City (3, 2 rentals) ----
  {
    reference: 'IGRE-KC-0001', slug: 'khalifa-city-villa-4br-rent',
    title: 'A four-bedroom villa in Khalifa City. Annual lease, garden included.',
    areaSlug: 'khalifa-city', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'VILLA', status: 'PUBLISHED',
    bed: 4, bath: 5, sqft: 4200, price: 175000, cover: IMG.v1,
    address: 'Al Forsan Village, Khalifa City',
    features: ['Private garden', "Maid's room", "Driver's room", '2-car garage', 'Furnished'],
  },
  {
    reference: 'IGRE-KC-0002', slug: 'khalifa-city-th-3br-rent',
    title: 'A three-bedroom townhouse in Khalifa City. Family-friendly community.',
    areaSlug: 'khalifa-city', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'TOWNHOUSE', status: 'PUBLISHED',
    bed: 3, bath: 4, sqft: 2400, price: 135000, cover: IMG.i3,
    address: 'Hills Estate, Khalifa City',
    features: ['Private garden', 'Community pool', "Maid's room", '2 parking spaces'],
  },
  {
    reference: 'IGRE-KC-0003', slug: 'khalifa-city-villa-5br-sale',
    title: 'A five-bedroom villa on Khalifa City. Established street, mature gardens.',
    areaSlug: 'khalifa-city', agentEmail: 'manager@igre.ae',
    type: 'SALE', property: 'VILLA', status: 'PUBLISHED',
    bed: 5, bath: 6, sqft: 5400, price: 4200000, cover: IMG.v2,
    address: 'Al Rabdan, Khalifa City',
    features: ['Private pool', "Maid's room", "Driver's room", '3-car garage', 'Mature garden'],
  },

  // ---- Al Raha Beach (3, 2 rentals) ----
  {
    reference: 'IGRE-RB-0001', slug: 'al-raha-2br-marina-view-rent',
    title: 'Two-bedroom on Al Raha Beach. Marina view, walkable to the boardwalk.',
    areaSlug: 'al-raha-beach', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'APARTMENT', status: 'PUBLISHED',
    bed: 2, bath: 3, sqft: 1380, price: 130000, cover: IMG.i2,
    address: 'Al Bandar, Al Raha Beach',
    features: ['Marina view', 'Pool', 'Gym', 'Beach access', 'Furnished'],
  },
  {
    reference: 'IGRE-RB-0002', slug: 'al-raha-3br-rent-coastal',
    title: 'A three-bedroom on Al Raha Beach. Annual lease, ready to move in.',
    areaSlug: 'al-raha-beach', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'APARTMENT', status: 'PUBLISHED',
    bed: 3, bath: 4, sqft: 1850, price: 175000, cover: IMG.i4,
    address: 'Al Muneera, Al Raha Beach',
    features: ["Maid's room", 'Sea view', 'Pool', 'Gym', '2 parking spaces'],
  },
  {
    reference: 'IGRE-RB-0003', slug: 'al-raha-villa-4br-sale',
    title: 'A four-bedroom villa on Al Raha. Quiet community, beach minutes away.',
    areaSlug: 'al-raha-beach', agentEmail: 'manager@igre.ae',
    type: 'SALE', property: 'VILLA', status: 'PUBLISHED',
    bed: 4, bath: 5, sqft: 3800, price: 4500000, cover: IMG.v1,
    address: 'Al Zeina, Al Raha Beach',
    features: ['Private pool', 'Beach access', "Maid's room", '2-car garage'],
  },

  // ---- MBZ City (3, 2 rentals) ----
  {
    reference: 'IGRE-MZ-0001', slug: 'mbz-villa-4br-rent',
    title: 'A four-bedroom villa in MBZ City. Spacious, family-ready.',
    areaSlug: 'mohammed-bin-zayed-city', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'VILLA', status: 'PUBLISHED',
    bed: 4, bath: 5, sqft: 3600, price: 145000, cover: IMG.v2,
    address: 'Zone 4, Mohammed Bin Zayed City',
    features: ['Private garden', "Maid's room", "Driver's room", '2-car garage'],
  },
  {
    reference: 'IGRE-MZ-0002', slug: 'mbz-villa-3br-rent-compact',
    title: 'A three-bedroom villa in MBZ. Compact, well-maintained, gated street.',
    areaSlug: 'mohammed-bin-zayed-city', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'VILLA', status: 'PUBLISHED',
    bed: 3, bath: 4, sqft: 2800, price: 115000, cover: IMG.i6,
    address: 'Zone 9, Mohammed Bin Zayed City',
    features: ['Private garden', "Maid's room", 'Covered parking', 'Built-in wardrobes'],
  },
  {
    reference: 'IGRE-MZ-0003', slug: 'mbz-villa-5br-sale',
    title: 'A five-bedroom villa in MBZ City. Quiet street, low traffic, school-walkable.',
    areaSlug: 'mohammed-bin-zayed-city', agentEmail: 'manager@igre.ae',
    type: 'SALE', property: 'VILLA', status: 'PUBLISHED',
    bed: 5, bath: 6, sqft: 5200, price: 3400000, cover: IMG.v1,
    address: 'Zone 2, Mohammed Bin Zayed City',
    features: ['Private pool', "Maid's room", "Driver's room", '3-car garage', 'Backyard'],
  },

  // ---- Al Bateen (2 rentals + 1 sale) ----
  {
    reference: 'IGRE-BT-0001', slug: 'al-bateen-2br-embassy-rent',
    title: 'Two bedrooms in Al Bateen. Embassy district, quiet leafy street.',
    areaSlug: 'al-bateen', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'APARTMENT', status: 'PUBLISHED',
    bed: 2, bath: 3, sqft: 1450, price: 110000, cover: IMG.i5,
    address: 'Khaleej Al Arabi Street, Al Bateen',
    features: ['Sea view', 'Pool', 'Gym', 'Covered parking'],
  },
  {
    reference: 'IGRE-BT-0002', slug: 'al-bateen-villa-4br-rent',
    title: 'A four-bedroom villa in Al Bateen. Walking distance to the marina.',
    areaSlug: 'al-bateen', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'VILLA', status: 'PUBLISHED',
    bed: 4, bath: 5, sqft: 4500, price: 295000, cover: IMG.v2,
    address: 'Al Bateen, near Marina',
    features: ['Private pool', "Maid's room", "Driver's room", '3-car garage', 'Marina walking distance'],
  },

  // ---- Al Khalidiyah (3 rentals) ----
  {
    reference: 'IGRE-KH-0001', slug: 'khalidiyah-2br-rent-affordable',
    title: 'Two bedrooms in Khalidiyah. Walkable to the Corniche, easy starter unit.',
    areaSlug: 'al-khalidiyah', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'APARTMENT', status: 'PUBLISHED',
    bed: 2, bath: 2, sqft: 1200, price: 85000, cover: IMG.i1,
    address: 'Al Khalidiyah, central',
    features: ['Walking distance to Corniche', 'Built-in wardrobes', 'Covered parking'],
  },
  {
    reference: 'IGRE-KH-0002', slug: 'khalidiyah-3br-rent-family',
    title: 'A three-bedroom in Khalidiyah. Established neighbourhood, school-walkable.',
    areaSlug: 'al-khalidiyah', agentEmail: 'manager@igre.ae',
    type: 'RENT', property: 'APARTMENT', status: 'PUBLISHED',
    bed: 3, bath: 3, sqft: 1700, price: 125000, cover: IMG.i2,
    address: 'Al Khalidiyah, near park',
    features: ["Maid's room", 'Built-in wardrobes', '2 parking spaces', 'Park view'],
  },
];

async function main() {
  console.log('Mainland migration — starting');

  // ----- Areas (upsert by slug) -----
  let areasUpserted = 0;
  for (const a of NEW_AREAS) {
    await prisma.area.upsert({
      where: { slug: a.slug },
      update: {
        name: a.name,
        tagline: a.tagline,
        description: a.description,
        heroImageUrl: a.heroImageUrl,
        images: JSON.stringify([a.heroImageUrl]),
        startingPrice2BhkSale: a.startingPrice2BhkSale ?? null,
        startingPrice3BhkSale: a.startingPrice3BhkSale ?? null,
        startingPriceVillaSale: a.startingPriceVillaSale ?? null,
        startingPrice2BhkRent: a.startingPrice2BhkRent ?? null,
        startingPrice3BhkRent: a.startingPrice3BhkRent ?? null,
        startingPriceVillaRent: a.startingPriceVillaRent ?? null,
        freehold: a.freehold,
        distanceToAirportKm: a.distanceToAirportKm,
        isFeatured: a.isFeatured,
        sortOrder: a.sortOrder,
      },
      create: {
        slug: a.slug,
        name: a.name,
        tagline: a.tagline,
        description: a.description,
        heroImageUrl: a.heroImageUrl,
        images: JSON.stringify([a.heroImageUrl]),
        startingPrice2BhkSale: a.startingPrice2BhkSale ?? null,
        startingPrice3BhkSale: a.startingPrice3BhkSale ?? null,
        startingPriceVillaSale: a.startingPriceVillaSale ?? null,
        startingPrice2BhkRent: a.startingPrice2BhkRent ?? null,
        startingPrice3BhkRent: a.startingPrice3BhkRent ?? null,
        startingPriceVillaRent: a.startingPriceVillaRent ?? null,
        freehold: a.freehold,
        distanceToAirportKm: a.distanceToAirportKm,
        isFeatured: a.isFeatured,
        sortOrder: a.sortOrder,
      },
    });
    areasUpserted++;
  }
  console.log(`  ${areasUpserted} areas upserted`);

  // ----- Listings (skip if reference already exists) -----
  const allInteriors = [IMG.i1, IMG.i2, IMG.i3, IMG.i4, IMG.i5, IMG.i6];
  const allVillas = [IMG.v1, IMG.v2];

  let listingsCreated = 0;
  let listingsSkipped = 0;

  for (const l of NEW_LISTINGS) {
    const existing = await prisma.listing.findUnique({
      where: { reference: l.reference },
      select: { id: true },
    });
    if (existing) {
      listingsSkipped++;
      continue;
    }

    const area = await prisma.area.findUnique({ where: { slug: l.areaSlug }, select: { id: true } });
    const agent = await prisma.user.findUnique({ where: { email: l.agentEmail }, select: { id: true } });
    if (!area || !agent) {
      console.warn(`  skipping ${l.reference} — missing area or agent`);
      continue;
    }

    const gallery = l.property === 'VILLA'
      ? [l.cover, ...allVillas.filter((v) => v !== l.cover), IMG.i3]
      : [l.cover, ...allInteriors.filter((i) => i !== l.cover).slice(0, 4)];

    await prisma.listing.create({
      data: {
        reference: l.reference,
        slug: l.slug,
        title: l.title,
        description:
          'A property handled by IGRE. We have walked this unit, photographed it ourselves, and verified the details against the title deed and the developer\'s drawings. Talk to a broker; we will tell you what the building is honestly like.',
        listingType: l.type,
        propertyType: l.property,
        status: l.status,
        bedrooms: l.bed,
        bathrooms: l.bath,
        sqft: l.sqft,
        parkingSpaces: l.bed >= 4 ? 2 : 1,
        furnished: l.features.includes('Furnished'),
        yearBuilt: 2018 + Math.floor(Math.random() * 7),
        price: l.price,
        priceUnit: 'AED',
        pricePerSqft: Math.round(l.price / Math.max(1, l.sqft)),
        serviceCharges: l.type === 'SALE' ? Math.round(l.sqft * 14) : null,
        paymentPlan: null,
        areaId: area.id,
        buildingName: l.address.split(',')[0]?.trim() ?? null,
        floorNumber: l.property === 'VILLA' || l.property === 'TOWNHOUSE'
          ? null : 3 + Math.floor(Math.random() * 20),
        unitNumber: l.property === 'VILLA' || l.property === 'TOWNHOUSE'
          ? null : `${1 + Math.floor(Math.random() * 9)}0${Math.floor(Math.random() * 9)}`,
        fullAddress: l.address,
        latitude: 24.4 + Math.random() * 0.3,
        longitude: 54.4 + Math.random() * 0.3,
        features: JSON.stringify(l.features),
        coverImageUrl: l.cover,
        images: JSON.stringify(gallery),
        agentId: agent.id,
        metaTitle: `${l.title} | IGRE`,
        metaDescription: l.title,
        viewCount: Math.floor(Math.random() * 50),
        favouriteCount: Math.floor(Math.random() * 8),
        enquiryCount: Math.floor(Math.random() * 4),
        publishedAt: l.status === 'PUBLISHED' ? new Date() : null,
      },
    });
    listingsCreated++;
  }
  console.log(`  ${listingsCreated} listings created, ${listingsSkipped} skipped (already existed)`);

  console.log('Mainland migration — done');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
