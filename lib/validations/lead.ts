import { z } from 'zod';

const leadStatusEnum = z.enum(['NEW', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'WON', 'LOST']);

export const leadCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).max(20),
  budget: z.coerce.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  agentId: z.string().cuid().optional(), // ADMIN sets this, MANAGER auto-uses self
  listingId: z.string().cuid().optional(),
  enquiryId: z.string().cuid().optional(),
  nextFollowUpAt: z.coerce.date().optional(),
});

export const leadUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phone: z.string().min(7).max(20).optional(),
  budget: z.coerce.number().int().positive().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: leadStatusEnum.optional(),
  agentId: z.string().cuid().optional(),
  nextFollowUpAt: z.coerce.date().nullable().optional(),
});

export const activityCreateSchema = z.object({
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'viewing', 'note']),
  content: z.string().min(1).max(2000),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;
