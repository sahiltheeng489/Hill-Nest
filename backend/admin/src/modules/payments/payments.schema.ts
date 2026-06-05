import { z } from 'zod';
import { PaymentStatus, RefundStatus, RefundType } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const paymentQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(PaymentStatus).optional(),
  customerId: z.string().optional(),
});

export const refundQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(RefundStatus).optional(),
});

export const approveRefundSchema = z.object({
  adminNotes: z.string().max(1000).optional(),
});

export const rejectRefundSchema = z.object({
  adminNotes: z.string().min(10, 'Rejection reason required (min 10 chars)').max(1000),
});

export const createRefundSchema = z.object({
  bookingId: z.string().min(1),
  paymentId: z.string().min(1),
  type: z.nativeEnum(RefundType),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
});
