import { prisma } from '../../config/database';
import { TicketStatus, AuditAction } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError } from '../../shared/errors';
import { Request } from 'express';

export async function listTickets(query: Record<string, unknown>, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'priority', 'status'], 'createdAt');
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignedToId) where.assignedToId = query.assignedToId;
  if (query.q) where.OR = [
    { subject: { contains: query.q, mode: 'insensitive' } },
    { customer: { name: { contains: query.q, mode: 'insensitive' } } },
    { customer: { email: { contains: query.q, mode: 'insensitive' } } },
  ];

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where, orderBy: { [sort.field]: sort.direction },
      skip: pagination.skip, take: pagination.limit,
      include: { customer: { select: { name: true, email: true } }, _count: { select: { notes: true } } },
    }),
    prisma.ticket.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getTicketById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { customer: true, notes: { orderBy: { createdAt: 'asc' } } },
  });
  if (!ticket) throw new NotFoundError('Ticket');
  return ticket;
}

export async function assignTicket(id: string, assignedToId: string, adminId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError('Ticket');
  const updated = await prisma.ticket.update({ where: { id }, data: { assignedToId } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.UPDATE, resource: 'ticket', resourceId: id, description: `Ticket assigned to admin ${assignedToId}` });
  return updated;
}

export async function addNote(ticketId: string, authorId: string, content: string, isInternal: boolean) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new NotFoundError('Ticket');
  return prisma.ticketNote.create({ data: { ticketId, authorId, content, isInternal } });
}

export async function updateTicketStatus(id: string, status: TicketStatus, adminId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError('Ticket');
  const now = new Date();
  const extra: Record<string, unknown> = {};
  if (status === TicketStatus.RESOLVED) extra.resolvedAt = now;
  if (status === TicketStatus.CLOSED) extra.closedAt = now;
  const updated = await prisma.ticket.update({ where: { id }, data: { status, ...extra } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.UPDATE, resource: 'ticket', resourceId: id, description: `Ticket status changed to ${status}` });
  return updated;
}

export async function escalateTicket(id: string, escalateTo: string, reason: string, adminId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError('Ticket');
  const updated = await prisma.ticket.update({ where: { id }, data: { escalatedAt: new Date(), escalatedTo: escalateTo, priority: 'URGENT' } });
  await prisma.ticketNote.create({ data: { ticketId: id, authorId: adminId, content: `Escalated to admin ${escalateTo}: ${reason}`, isInternal: true } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.UPDATE, resource: 'ticket', resourceId: id, description: `Ticket escalated: ${reason}` });
  return updated;
}
