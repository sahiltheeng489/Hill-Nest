import { prisma } from '../../config/database';
import { AuditAction } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError } from '../../shared/errors';
import type { CustomerQueryInput, UpdateCustomerStatusInput } from './customers.schema';
import { Request } from 'express';
import { UserStatus } from '@prisma/client';

export async function listCustomers(query: CustomerQueryInput, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'name', 'email', 'totalBookings', 'totalSpent'], 'createdAt');

  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
      { phone: { contains: query.q } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { [sort.field]: sort.direction },
      skip: pagination.skip,
      take: pagination.limit,
      select: {
        id: true, mongoId: true, email: true, name: true, phone: true,
        status: true, emailVerified: true, totalBookings: true, totalSpent: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new NotFoundError('Customer');

  const [recentBookings, tickets, activityLogs] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { payment: { select: { status: true, amount: true } } },
    }),
    prisma.ticket.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.activityLog.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return { customer, recentBookings, tickets, activityLogs };
}

export async function updateCustomerStatus(
  id: string,
  adminId: string,
  input: UpdateCustomerStatusInput
) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new NotFoundError('Customer');

  const updated = await prisma.customer.update({
    where: { id },
    data: { status: input.status },
  });

  const action = input.status === UserStatus.ACTIVE
    ? AuditAction.CUSTOMER_REACTIVATED
    : AuditAction.CUSTOMER_SUSPENDED;

  await writeAuditLog({
    adminUserId: adminId,
    action,
    resource: 'customer',
    resourceId: id,
    description: `Customer ${input.status === UserStatus.ACTIVE ? 'reactivated' : 'suspended'}: ${customer.email}`,
    metadata: { reason: input.reason, oldStatus: customer.status, newStatus: input.status },
  });

  return updated;
}

export async function updateCustomerNotes(id: string, notes: string | null) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new NotFoundError('Customer');
  return prisma.customer.update({ where: { id }, data: { notes } });
}
