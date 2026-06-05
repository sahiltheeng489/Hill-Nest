import { prisma } from '../../config/database';
import { RefundStatus, AuditAction } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError, BadRequestError, UnprocessableError } from '../../shared/errors';
import { Request } from 'express';

export async function listRefunds(query: Record<string, unknown>, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'amount', 'status'], 'createdAt');
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  const [items, total] = await Promise.all([
    prisma.refund.findMany({
      where, orderBy: { [sort.field]: sort.direction },
      skip: pagination.skip, take: pagination.limit,
      include: {
        booking: { include: { customer: { select: { name: true, email: true } } } },
        payment: { select: { amount: true, status: true } },
      },
    }),
    prisma.refund.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getRefundById(id: string) {
  const r = await prisma.refund.findUnique({ where: { id }, include: { booking: { include: { customer: true } }, payment: true } });
  if (!r) throw new NotFoundError('Refund');
  return r;
}

export async function approveRefund(id: string, adminId: string, adminNotes?: string) {
  const refund = await prisma.refund.findUnique({ where: { id }, include: { payment: true } });
  if (!refund) throw new NotFoundError('Refund');
  if (refund.status !== RefundStatus.PENDING) throw new UnprocessableError(`Cannot approve a ${refund.status} refund`);

  const updated = await prisma.refund.update({
    where: { id },
    data: { status: RefundStatus.APPROVED, approvedBy: adminId, adminNotes, processedAt: new Date() },
  });

  await writeAuditLog({
    adminUserId: adminId,
    action: AuditAction.REFUND_APPROVED,
    resource: 'refund',
    resourceId: id,
    description: `Refund approved: ₹${refund.amount}`,
    metadata: { adminNotes },
  });
  return updated;
}

export async function rejectRefund(id: string, adminId: string, adminNotes: string) {
  const refund = await prisma.refund.findUnique({ where: { id } });
  if (!refund) throw new NotFoundError('Refund');
  if (refund.status !== RefundStatus.PENDING) throw new UnprocessableError(`Cannot reject a ${refund.status} refund`);

  const updated = await prisma.refund.update({
    where: { id },
    data: { status: RefundStatus.REJECTED, rejectedBy: adminId, adminNotes, rejectedAt: new Date() },
  });

  await writeAuditLog({
    adminUserId: adminId,
    action: AuditAction.REFUND_REJECTED,
    resource: 'refund',
    resourceId: id,
    description: `Refund rejected`,
    metadata: { adminNotes },
  });
  return updated;
}

export async function createRefund(input: { bookingId: string; paymentId: string; type: 'FULL' | 'PARTIAL'; amount: number; reason: string }, adminId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId } });
  if (!payment) throw new NotFoundError('Payment');
  if (input.amount > Number(payment.amount)) throw new BadRequestError('Refund amount exceeds payment amount');

  return prisma.refund.create({
    data: { ...input, requestedBy: adminId, status: RefundStatus.PENDING },
  });
}

export async function getRefundStats() {
  return prisma.refund.groupBy({
    by: ['status'],
    _count: { _all: true },
    _sum: { amount: true },
  });
}
