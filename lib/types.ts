// Shared string-union types for fields stored as `String` in SQLite.
// Keep these in sync with the comments in prisma/schema.prisma.

export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export type ListingType = 'SALE' | 'RENT' | 'LEASE';

export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'TOWNHOUSE'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'OFFPLAN';

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PUBLISHED'
  | 'RESERVED'
  | 'SOLD_RENTED'
  | 'ARCHIVED';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'VIEWING_SCHEDULED'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST';

export type EnquiryType =
  | 'GENERAL'
  | 'PROPERTY_SPECIFIC'
  | 'COLLABORATION'
  | 'VALUATION';

export type ViewingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const ROLES: Role[] = ['ADMIN', 'MANAGER', 'USER'];
export const LISTING_TYPES: ListingType[] = ['SALE', 'RENT', 'LEASE'];
export const PROPERTY_TYPES: PropertyType[] = ['APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'STUDIO', 'OFFPLAN'];
export const LISTING_STATUSES: ListingStatus[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'RESERVED', 'SOLD_RENTED', 'ARCHIVED'];
export const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'WON', 'LOST'];
export const ENQUIRY_TYPES: EnquiryType[] = ['GENERAL', 'PROPERTY_SPECIFIC', 'COLLABORATION', 'VALUATION'];
