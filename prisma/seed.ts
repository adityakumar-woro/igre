/**
 * IGRE — seed script
 *
 * Run with: `npm run db:seed`
 *
 * Creates: 4 staff + 1 demo user, 6 areas, 18 listings, 6 enquiries,
 * 3 viewing requests, and core site settings.
 *
 * All staff accounts use SEED_DEFAULT_PASSWORD (default: "IGRE@2026") and have
 * forcePasswordChange = true so they must change it on first login.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'IGRE@2026';
const DEMO_PASSWORD = 'Demo@2026';

// Unsplash placeholders — wide architectural / Abu Dhabi / interior shots.
// Marked everywhere with data-placeholder="true" in components.
const HERO = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2400&q=80';
const ABU_DHABI_CORNICHE = 'https://images.unsplash.com/photo-1583425423320-eb8617c01da2?w=2400&q=80';
const SAADIYAT = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2400&q=80';
const REEM = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=2400&q=80';
const YAS = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=2400&q=80';
const HUDAYRIYAT = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2400&q=80';
const FERRARI = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=2400&q=80';

const INTERIOR_1 = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=80';
const INTERIOR_2 = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=80';
const INTERIOR_3 = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=80';
const INTERIOR_4 = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1800&q=80';
const INTERIOR_5 = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1800&q=80';
const INTERIOR_6 = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1800&q=80';
const VILLA_1 = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1800&q=80';
const VILLA_2 = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1800&q=80';
const VILLA_3 = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1800&q=80';

async function main() {
  console.log('IGRE seed — starting');

  // -------------------------------------------------------------------------
  // Wipe in dependency order (safe to re-run)
  // -------------------------------------------------------------------------
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.viewingRequest.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const kaiser = await prisma.user.create({
    data: {
      email: 'igre.kaiser@gmail.com',
      phone: '+971581005220',
      name: 'MD Kaiser Mahmud',
      passwordHash,
      role: 'ADMIN',
      bio: 'Founder & Managing Director. Property in Abu Dhabi since day one.',
      forcePasswordChange: true,
      avatarUrl: '/team/Kaiser.png',
    },
  });

  const asad = await prisma.user.create({
    data: {
      email: 'igre.asad@gmail.com',
      phone: '+971502416589',
      name: 'Mohammed Asaduzzaman',
      passwordHash,
      role: 'MANAGER',
      bio: 'Co-Founder & Head of Sales. Specialises in Saadiyat and Yas Island.',
      forcePasswordChange: true,
      avatarUrl: '/team/Asaduzzaman.png',
    },
  });

  const faisal = await prisma.user.create({
    data: {
      email: 'faisalvpz2777@gmail.com',
      phone: '+971525697405',
      name: 'Muhammad Faisal',
      passwordHash,
      role: 'MANAGER',
      bio: 'Senior Property Consultant. Reem Island and Corniche specialist.',
      forcePasswordChange: true,
      avatarUrl: '/team/Faisal.png',
    },
  });

  const arman = await prisma.user.create({
    data: {
      email: 'ashikuzzamanarman@gmail.com',
      phone: '+971525697420',
      name: 'Ashikuzzaman Arman',
      passwordHash,
      role: 'MANAGER',
      bio: 'Senior Property Consultant. Hudayriyat and Yas Bay portfolio.',
      forcePasswordChange: true,
      avatarUrl: '/team/ashikuzzamanarman.png',
    },
  });

  await prisma.user.create({
    data: {
      email: 'demo@igre.ae',
      phone: '+971500000000',
      name: 'Demo User',
      passwordHash: demoHash,
      role: 'USER',
      forcePasswordChange: false,
    },
  });

  console.log('  - 5 users created (4 staff + 1 demo)');

  // -------------------------------------------------------------------------
  // Areas
  // -------------------------------------------------------------------------
  const saadiyat = await prisma.area.create({
    data: {
      slug: 'al-saadiyat-island',
      name: 'Al Saadiyat Island',
      tagline: 'Where the Louvre meets the lagoon.',
      description:
        'Al Saadiyat is the cultural heart of Abu Dhabi — the Louvre, Guggenheim, and Zayed National Museum sit alongside white-sand beaches and freehold residences. The island reads as a quiet counterpoint to the mainland: low buildings, long sightlines, the sea always close.',
      heroImageUrl: SAADIYAT,
      images: JSON.stringify([SAADIYAT, INTERIOR_1, VILLA_1]),
      startingPrice2BhkSale: 2200000,
      startingPrice3BhkSale: 3500000,
      startingPriceVillaSale: 6300000,
      startingPrice2BhkRent: 130000,
      startingPrice3BhkRent: 180000,
      startingPriceVillaRent: 300000,
      freehold: true,
      distanceToAirportKm: 22,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const reem = await prisma.area.create({
    data: {
      slug: 'al-reem-island',
      name: 'Al Reem Island',
      tagline: 'A working city island, fifteen minutes from downtown.',
      description:
        'Reem is Abu Dhabi at human pace — towers along the canal, a long promenade, schools and offices and quiet residential pockets all stitched together. Freehold since 2019, it is the most accessible introduction to ownership in the capital.',
      heroImageUrl: REEM,
      images: JSON.stringify([REEM, INTERIOR_2, INTERIOR_3]),
      startingPrice2BhkSale: 1140000,
      startingPrice3BhkSale: 1800000,
      startingPrice2BhkRent: 95000,
      startingPrice3BhkRent: 130000,
      freehold: true,
      distanceToAirportKm: 28,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const corniche = await prisma.area.create({
    data: {
      slug: 'corniche-road',
      name: 'Abu Dhabi Corniche Road',
      tagline: 'The address every Abu Dhabian knows by heart.',
      description:
        'Eight kilometres of palm-lined waterfront in the centre of the city. Corniche Road residences look directly onto the Gulf — the buildings are older, taller, and set among the city\'s oldest streets. This is established Abu Dhabi.',
      heroImageUrl: ABU_DHABI_CORNICHE,
      images: JSON.stringify([ABU_DHABI_CORNICHE, INTERIOR_4, INTERIOR_5]),
      startingPrice2BhkSale: 1800000,
      startingPrice3BhkSale: 2800000,
      startingPrice2BhkRent: 90000,
      startingPrice3BhkRent: 140000,
      freehold: false,
      distanceToAirportKm: 32,
      isFeatured: false,
      sortOrder: 3,
    },
  });

  const yas = await prisma.area.create({
    data: {
      slug: 'yas-island',
      name: 'Yas Island',
      tagline: 'Theme-park energy, residential calm.',
      description:
        'Yas holds Ferrari World, Yas Marina Circuit, and the F1 in November — but step into the residential clusters and the noise drops away. Townhouses, villas, and a growing apartment scene around Yas Bay.',
      heroImageUrl: YAS,
      images: JSON.stringify([YAS, VILLA_2, INTERIOR_6]),
      startingPrice2BhkSale: 1400000,
      startingPrice3BhkSale: 2200000,
      startingPrice2BhkRent: 110000,
      startingPrice3BhkRent: 160000,
      startingPriceVillaSale: 3000000,
      startingPriceVillaRent: 250000,
      freehold: true,
      distanceToAirportKm: 8,
      isFeatured: true,
      sortOrder: 4,
    },
  });

  const hudayriyat = await prisma.area.create({
    data: {
      slug: 'hudayriyat-island',
      name: 'Hudayriyat Island',
      tagline: 'The newest coastline. Designed slowly.',
      description:
        'Hudayriyat is being built deliberately — beaches, BMX tracks, a velodrome, and a low-rise residential masterplan. Townhouses and villas come first; apartments will follow. For buyers willing to be early, the entry point is unusual for Abu Dhabi.',
      heroImageUrl: HUDAYRIYAT,
      images: JSON.stringify([HUDAYRIYAT, VILLA_3, INTERIOR_1]),
      startingPrice2BhkSale: 1600000,
      startingPrice3BhkSale: 2500000,
      startingPriceVillaSale: 4500000,
      freehold: true,
      distanceToAirportKm: 26,
      isFeatured: false,
      sortOrder: 5,
    },
  });

  const ferrari = await prisma.area.create({
    data: {
      slug: 'ferrari-yas-bay',
      name: 'Ferrari World / Yas Bay',
      tagline: 'Live where the city goes out.',
      description:
        'Yas Bay is the entertainment edge of Yas Island — the arena, the boardwalk, the restaurants, the F1 paddock. A small but growing residential offering puts you walking distance from the loudest evenings in Abu Dhabi.',
      heroImageUrl: FERRARI,
      images: JSON.stringify([FERRARI, INTERIOR_2, INTERIOR_3]),
      startingPrice2BhkSale: 1500000,
      startingPrice3BhkSale: 2400000,
      freehold: true,
      distanceToAirportKm: 9,
      isFeatured: false,
      sortOrder: 6,
    },
  });

  console.log('  - 6 areas created');

  // -------------------------------------------------------------------------
  // Listings
  // -------------------------------------------------------------------------
  const allInteriors = [INTERIOR_1, INTERIOR_2, INTERIOR_3, INTERIOR_4, INTERIOR_5, INTERIOR_6];
  const allVillas = [VILLA_1, VILLA_2, VILLA_3];

  const listings = [
    // -------- Saadiyat (3) --------
    {
      ref: 'IGRE-SD-0001',
      slug: 'saadiyat-beach-residences-3br-sea-view',
      title: 'A three-bedroom on Saadiyat Beach. Sea view, walking distance to the Louvre.',
      area: saadiyat,
      agent: asad,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 2400,
      price: 4900000,
      cover: INTERIOR_1,
      address: 'Saadiyat Beach Residences, Al Saadiyat Island',
      features: ['Direct sea view', 'Beach access', "Maid's room", 'Built-in wardrobes', 'Italian kitchen', 'Covered parking'],
    },
    {
      ref: 'IGRE-SD-0002',
      slug: 'saadiyat-villa-5br-private-beach',
      title: 'A five-bedroom villa with a private beach lawn on Saadiyat.',
      area: saadiyat,
      agent: asad,
      type: 'SALE',
      property: 'VILLA',
      status: 'PUBLISHED',
      bed: 5,
      bath: 6,
      sqft: 6800,
      price: 12500000,
      cover: VILLA_1,
      address: 'Hidd Al Saadiyat, Al Saadiyat Island',
      features: ['Private pool', 'Beach lawn', 'Gym', 'Cinema room', "Driver's room", "Maid's room", '4-car garage'],
    },
    {
      ref: 'IGRE-SD-0003',
      slug: 'mamsha-2br-canal-view',
      title: 'Two bedrooms on Mamsha. Looks onto the canal, not the road.',
      area: saadiyat,
      agent: faisal,
      type: 'RENT',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 2,
      sqft: 1380,
      price: 175000,
      cover: INTERIOR_2,
      address: 'Mamsha Al Saadiyat, Al Saadiyat Island',
      features: ['Canal view', 'Furnished', 'Pool', 'Gym', 'Beach access'],
    },

    // -------- Reem (3) --------
    {
      ref: 'IGRE-RM-0001',
      slug: 'reem-gate-tower-2br',
      title: 'Two-bedroom in Gate Tower. Bright, mid-floor, Corniche view.',
      area: reem,
      agent: faisal,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 3,
      sqft: 1450,
      price: 1280000,
      cover: INTERIOR_3,
      address: 'Gate Tower 2, Al Reem Island',
      features: ['City view', 'Pool', 'Gym', 'Built-in wardrobes', 'Covered parking'],
    },
    {
      ref: 'IGRE-RM-0002',
      slug: 'reem-marina-square-3br-rent',
      title: 'Three-bedroom in Marina Square. Annual lease, available now.',
      area: reem,
      agent: faisal,
      type: 'RENT',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 1900,
      price: 145000,
      cover: INTERIOR_4,
      address: 'Marina Square, Al Reem Island',
      features: ["Maid's room", 'Sea view', 'Gym', 'Pool', '2 parking spaces'],
    },
    {
      ref: 'IGRE-RM-0003',
      slug: 'reem-shams-2br-canal',
      title: 'Two-bedroom on the Reem canal. Furnished, ready to move in.',
      area: reem,
      agent: arman,
      type: 'RENT',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 2,
      sqft: 1280,
      price: 110000,
      cover: INTERIOR_5,
      address: 'Sun Tower, Shams Abu Dhabi, Al Reem Island',
      features: ['Furnished', 'Canal view', 'Gym', 'Pool', '24/7 security'],
    },

    // -------- Corniche (3) --------
    {
      ref: 'IGRE-CR-0001',
      slug: 'corniche-3br-direct-sea-view',
      title: 'Three bedrooms on the Corniche. Sea on three sides.',
      area: corniche,
      agent: faisal,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 2100,
      price: 3200000,
      cover: INTERIOR_6,
      address: 'Corniche Tower, Corniche Road',
      features: ['Sea view', 'High floor', 'Gym', 'Pool', 'Covered parking'],
    },
    {
      ref: 'IGRE-CR-0002',
      slug: 'corniche-2br-rent-classic',
      title: 'Two bedrooms on the Corniche. Classic Abu Dhabi address.',
      area: corniche,
      agent: faisal,
      type: 'RENT',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 3,
      sqft: 1600,
      price: 110000,
      cover: INTERIOR_1,
      address: 'Etihad Towers Residence, Corniche Road',
      features: ['Sea view', 'Pool', 'Beach access', 'Concierge'],
    },
    {
      ref: 'IGRE-CR-0003',
      slug: 'corniche-penthouse-4br',
      title: 'A four-bedroom penthouse on the Corniche. Top floor, full wrap.',
      area: corniche,
      agent: asad,
      type: 'SALE',
      property: 'PENTHOUSE',
      status: 'PENDING',
      bed: 4,
      bath: 5,
      sqft: 4200,
      price: 9800000,
      cover: INTERIOR_2,
      address: 'Nation Towers, Corniche Road',
      features: ['Wrap-around terrace', 'Private lift', "Maid's room", 'Cinema', 'Sea view'],
    },

    // -------- Yas (3) --------
    {
      ref: 'IGRE-YS-0001',
      slug: 'yas-acres-4br-villa',
      title: 'A four-bedroom villa on Yas Acres. Pool, garden, golf-course adjacency.',
      area: yas,
      agent: arman,
      type: 'SALE',
      property: 'VILLA',
      status: 'PUBLISHED',
      bed: 4,
      bath: 5,
      sqft: 3800,
      price: 4200000,
      cover: VILLA_2,
      address: 'Yas Acres, Yas Island',
      features: ['Private pool', 'Garden', "Maid's room", 'Golf-course view', '2-car garage'],
    },
    {
      ref: 'IGRE-YS-0002',
      slug: 'yas-bay-2br-apartment',
      title: 'Two bedrooms on Yas Bay. The walkway is a thirty-second walk.',
      area: yas,
      agent: arman,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 2,
      sqft: 1320,
      price: 1650000,
      cover: INTERIOR_3,
      address: 'The Bay Residences, Yas Bay',
      features: ['Bay view', 'Pool', 'Gym', 'Walkway access'],
    },
    {
      ref: 'IGRE-YS-0003',
      slug: 'yas-acres-th-3br-rent',
      title: 'A three-bedroom townhouse on Yas. Annual rent, garden included.',
      area: yas,
      agent: arman,
      type: 'RENT',
      property: 'TOWNHOUSE',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 2400,
      price: 195000,
      cover: VILLA_3,
      address: 'Yas Acres Townhouses, Yas Island',
      features: ['Private garden', "Maid's room", 'Community pool', '2 parking spaces'],
    },

    // -------- Hudayriyat (3) --------
    {
      ref: 'IGRE-HD-0001',
      slug: 'hudayriyat-villa-4br-coastal',
      title: 'A four-bedroom coastal villa on Hudayriyat. Off-plan, handover 2027.',
      area: hudayriyat,
      agent: asad,
      type: 'SALE',
      property: 'VILLA',
      status: 'PUBLISHED',
      bed: 4,
      bath: 5,
      sqft: 4100,
      price: 5800000,
      cover: VILLA_1,
      address: 'Nawayef West, Hudayriyat Island',
      features: ['Coastal plot', 'Private pool', "Maid's room", 'Off-plan', '60/40 payment plan'],
    },
    {
      ref: 'IGRE-HD-0002',
      slug: 'hudayriyat-th-3br',
      title: 'A three-bedroom townhouse on Hudayriyat. Walking distance to the beach.',
      area: hudayriyat,
      agent: arman,
      type: 'SALE',
      property: 'TOWNHOUSE',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 2600,
      price: 2800000,
      cover: INTERIOR_4,
      address: 'Al Naseem, Hudayriyat Island',
      features: ['Private garden', 'Community pool', 'Beach access', "Maid's room"],
    },
    {
      ref: 'IGRE-HD-0003',
      slug: 'hudayriyat-villa-5br-draft',
      title: 'A five-bedroom villa on Hudayriyat. Plot 042. Draft.',
      area: hudayriyat,
      agent: asad,
      type: 'SALE',
      property: 'VILLA',
      status: 'DRAFT',
      bed: 5,
      bath: 6,
      sqft: 5400,
      price: 7500000,
      cover: VILLA_2,
      address: 'Nawayef Heights, Hudayriyat Island',
      features: ['Sea view', 'Private pool', "Maid's room", "Driver's room", '3-car garage'],
    },

    // -------- Ferrari/Yas Bay (3) --------
    {
      ref: 'IGRE-FR-0001',
      slug: 'yas-bay-3br-arena-side',
      title: 'A three-bedroom in Yas Bay. Arena side, terrace included.',
      area: ferrari,
      agent: arman,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 3,
      bath: 4,
      sqft: 1850,
      price: 2750000,
      cover: INTERIOR_5,
      address: 'Yas Bay Residences, Yas Island',
      features: ['Arena view', 'Terrace', 'Pool', 'Gym', '2 parking spaces'],
    },
    {
      ref: 'IGRE-FR-0002',
      slug: 'yas-bay-2br-rent-furnished',
      title: 'A two-bedroom in Yas Bay. Furnished, twelve-month lease.',
      area: ferrari,
      agent: arman,
      type: 'RENT',
      property: 'APARTMENT',
      status: 'PUBLISHED',
      bed: 2,
      bath: 3,
      sqft: 1400,
      price: 135000,
      cover: INTERIOR_6,
      address: 'Yas Bay Residences, Yas Island',
      features: ['Furnished', 'Bay view', 'Pool', 'Gym'],
    },
    {
      ref: 'IGRE-FR-0003',
      slug: 'yas-bay-1br-pending',
      title: 'A one-bedroom in Yas Bay. Pending review.',
      area: ferrari,
      agent: faisal,
      type: 'SALE',
      property: 'APARTMENT',
      status: 'PENDING',
      bed: 1,
      bath: 2,
      sqft: 880,
      price: 1180000,
      cover: INTERIOR_1,
      address: 'Yas Bay Residences, Yas Island',
      features: ['City view', 'Pool', 'Gym', 'Walkway access'],
    },
  ] as const;

  for (const l of listings) {
    const gallery = l.property === 'VILLA'
      ? [l.cover, ...allVillas.filter((v) => v !== l.cover).slice(0, 2), INTERIOR_3]
      : [l.cover, ...allInteriors.filter((i) => i !== l.cover).slice(0, 4)];

    await prisma.listing.create({
      data: {
        reference: l.ref,
        slug: l.slug,
        title: l.title,
        description:
          'A property handled by IGRE. We have walked this unit, photographed it ourselves, and verified the details against the title deed and the developer\'s drawings. The starting price is indicative — actual figures vary by view, floor, and finish. Talk to a broker; we will tell you what the building is honestly like.',
        listingType: l.type,
        propertyType: l.property,
        status: l.status,
        bedrooms: l.bed,
        bathrooms: l.bath,
        sqft: l.sqft,
        parkingSpaces: l.bed >= 4 ? 2 : 1,
        furnished: (l.features as readonly string[]).includes('Furnished'),
        yearBuilt: 2020 + Math.floor(Math.random() * 5),
        price: l.price,
        priceUnit: 'AED',
        pricePerSqft: Math.round(l.price / l.sqft),
        serviceCharges: l.type === 'SALE' ? Math.round(l.sqft * 16) : null,
        paymentPlan: (l.features as readonly string[]).includes('Off-plan') ? '60/40' : null,
        areaId: l.area.id,
        buildingName: l.address.split(',')[0]?.trim() ?? null,
        floorNumber: l.property === 'VILLA' ? null : 4 + Math.floor(Math.random() * 30),
        unitNumber: l.property === 'VILLA' ? null : `${1 + Math.floor(Math.random() * 12)}0${Math.floor(Math.random() * 9)}`,
        fullAddress: l.address,
        latitude: 24.4 + Math.random() * 0.3,
        longitude: 54.3 + Math.random() * 0.3,
        features: JSON.stringify(l.features),
        coverImageUrl: l.cover,
        images: JSON.stringify(gallery),
        agentId: l.agent.id,
        metaTitle: `${l.title} | IGRE`,
        metaDescription: l.title,
        viewCount: Math.floor(Math.random() * 250),
        favouriteCount: Math.floor(Math.random() * 40),
        enquiryCount: Math.floor(Math.random() * 15),
        publishedAt: l.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }
  console.log(`  - ${listings.length} listings created`);

  // -------------------------------------------------------------------------
  // Enquiries
  // -------------------------------------------------------------------------
  const enquiries = [
    { name: 'Sarah Ahmed', email: 'sarah@example.com', phone: '+971501112233', message: 'Interested in the 3BR on Saadiyat Beach. Available next weekend?', type: 'PROPERTY_SPECIFIC', status: 'NEW' },
    { name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+971502223344', message: 'Looking to rent a 2BR on Reem before September.', type: 'GENERAL', status: 'CONTACTED' },
    { name: 'Layla Hosseini', email: 'layla@example.com', phone: '+971503334455', message: 'Considering a Saadiyat villa for my family. Schools nearby?', type: 'PROPERTY_SPECIFIC', status: 'VIEWING_SCHEDULED' },
    { name: 'Henrik Olsen', email: 'henrik@example.com', phone: '+971504445566', message: 'Broker in Dubai. Have a buyer for Yas. Open to co-broking?', type: 'COLLABORATION', status: 'NEW' },
    { name: 'Priya Iyer', email: 'priya@example.com', phone: '+971505556677', message: 'Need a valuation on a Reem 2BR I bought in 2021.', type: 'VALUATION', status: 'CONTACTED' },
    { name: 'Khalifa Al Mansoori', email: 'khalifa@example.com', phone: '+971506667788', message: 'Hudayriyat off-plan villa — what\'s actually delivered vs marketing?', type: 'PROPERTY_SPECIFIC', status: 'NEGOTIATING' },
  ];
  for (const e of enquiries) {
    await prisma.enquiry.create({ data: { ...e, source: 'website' } });
  }
  console.log(`  - ${enquiries.length} enquiries created`);

  // -------------------------------------------------------------------------
  // Viewing requests
  // -------------------------------------------------------------------------
  const oneListing = await prisma.listing.findFirst({ where: { status: 'PUBLISHED' } });
  if (oneListing) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const next3 = new Date(); next3.setDate(next3.getDate() + 3);
    const next7 = new Date(); next7.setDate(next7.getDate() + 7);

    await prisma.viewingRequest.createMany({
      data: [
        { listingId: oneListing.id, name: 'Sarah Ahmed', email: 'sarah@example.com', phone: '+971501112233', preferredDate: tomorrow, preferredTime: '11:00', status: 'CONFIRMED' },
        { listingId: oneListing.id, name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+971502223344', preferredDate: next3, preferredTime: '15:30', status: 'PENDING' },
        { listingId: oneListing.id, name: 'Layla Hosseini', email: 'layla@example.com', phone: '+971503334455', preferredDate: next7, preferredTime: '10:00', status: 'PENDING' },
      ],
    });
  }
  console.log('  - 3 viewing requests created');

  // -------------------------------------------------------------------------
  // Site settings
  // -------------------------------------------------------------------------
  const settings: Record<string, string> = {
    company_name: 'IGRE — Real Estate Brokers',
    company_phone: '+971581005220',
    company_email: 'igre.kaiser@gmail.com',
    company_address: 'Building C3, Office M3, Abu Dhabi, UAE',
    company_map_url: 'https://maps.app.goo.gl/DMp1ykHUzmtbbG4u9',
    rera_license: 'TODO-RERA-LICENSE',
    instagram_url: 'https://instagram.com/',
    linkedin_url: 'https://linkedin.com/',
    whatsapp_number: '971581005220',
    footer_copyright: `© ${new Date().getFullYear()} IGRE Real Estate Brokers. All rights reserved.`,
    listing_disclaimer: 'Indicative starting price based on current market data. Actual prices vary by tower, view, and finish.',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.create({ data: { key, value } });
  }
  console.log(`  - ${Object.keys(settings).length} site settings written`);

  // Reference the variables to keep TS happy with unused warnings off in strict mode
  void kaiser; void asad; void faisal; void arman;

  console.log('IGRE seed — done');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
