import { z } from 'zod';

const listingTypeEnum = z.enum(['SALE', 'RENT', 'LEASE']);
const propertyTypeEnum = z.enum(['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'STUDIO', 'OFFPLAN']);
const listingStatusEnum = z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'RESERVED', 'SOLD_RENTED', 'ARCHIVED']);

export const listingFiltersSchema = z.object({
  q: z.string().max(80).optional(),
  area: z.string().optional(),
  listingType: listingTypeEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  bedrooms: z.coerce.number().int().min(0).max(10).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});

export const listingCreateSchema = z.object({
  title: z.string().min(8).max(180),
  description: z.string().min(20).max(5000),
  listingType: listingTypeEnum,
  propertyType: propertyTypeEnum,
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  sqft: z.coerce.number().int().positive(),
  parkingSpaces: z.coerce.number().int().min(0).max(20).default(1),
  furnished: z.coerce.boolean().default(false),
  yearBuilt: z.coerce.number().int().min(1900).max(2100).optional(),
  price: z.coerce.number().int().positive(),
  serviceCharges: z.coerce.number().int().nonnegative().optional(),
  paymentPlan: z.string().max(80).optional(),
  areaId: z.string().cuid(),
  buildingName: z.string().max(120).optional(),
  floorNumber: z.coerce.number().int().min(0).max(200).optional(),
  unitNumber: z.string().max(20).optional(),
  fullAddress: z.string().min(5).max(300),
  features: z.array(z.string().max(60)).default([]),
  coverImageUrl: z.string().url(),
  images: z.array(z.string().url()).default([]),
  floorPlanUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  virtualTourUrl: z.string().url().optional(),
  agentId: z.string().cuid().optional(), // ADMIN may set this; MANAGER auto-uses self
  metaTitle: z.string().max(180).optional(),
  metaDescription: z.string().max(280).optional(),
});

export const listingUpdateSchema = listingCreateSchema.partial().extend({
  status: listingStatusEnum.optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
