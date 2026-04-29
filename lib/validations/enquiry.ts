import { z } from 'zod';

export const enquirySchema = z.object({
  type: z.enum(['GENERAL', 'PROPERTY_SPECIFIC', 'COLLABORATION', 'VALUATION']).default('GENERAL'),
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20),
  message: z.string().min(5).max(2000),
  budget: z.coerce.number().int().positive().optional(),
  preferredArea: z.string().max(80).optional(),
  listingId: z.string().cuid().optional(),
});

export const viewingRequestSchema = z.object({
  listingId: z.string().cuid(),
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20),
  preferredDate: z.coerce.date(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  notes: z.string().max(500).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;
