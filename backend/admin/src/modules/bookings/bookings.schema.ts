import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const bookingQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(BookingStatus).optional(),
  customerId: z.string().optional(),
  roomName: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(500),
});

export const rescheduleBookingSchema = z.object({
  checkIn: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid check-in date'),
  checkOut: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid check-out date'),
  reason: z.string().max(500).optional(),
});

export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
