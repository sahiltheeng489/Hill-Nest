import { z } from 'zod';
import { RefundStatus, RefundType } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const refundQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(RefundStatus).optional(),
});

export const approveRefundSchema = z.object({
  adminNotes: z.string().optional(),
});

export const rejectRefundSchema = z.object({
  adminNotes: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const createRefundSchema = z.object({
  bookingId: z.string().min(1),
  paymentId: z.string().min(1),
  type: z.nativeEnum(RefundType),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export type RefundQueryInput = z.infer<typeof refundQuerySchema>;
export type ApproveRefundInput = z.infer<typeof approveRefundSchema>;
export type RejectRefundInput = z.infer<typeof rejectRefundSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
