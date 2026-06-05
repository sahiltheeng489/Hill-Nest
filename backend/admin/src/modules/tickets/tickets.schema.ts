import { z } from 'zod';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { paginationSchema } from '../../middleware/validate';

export const ticketQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  assignedToId: z.string().optional(),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().min(1, 'Assignee ID is required'),
});

export const addNoteSchema = z.object({
  content: z.string().min(5, 'Note must be at least 5 characters'),
  isInternal: z.boolean().default(true),
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

export const escalateTicketSchema = z.object({
  escalateTo: z.string().min(1, 'Escalation target admin ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type EscalateTicketInput = z.infer<typeof escalateTicketSchema>;
