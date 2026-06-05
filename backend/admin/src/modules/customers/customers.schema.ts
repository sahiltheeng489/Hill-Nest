import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const customerQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(UserStatus).optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().max(500).optional(),
});

export const updateCustomerNotesSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
});

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
