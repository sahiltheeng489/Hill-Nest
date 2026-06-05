import { prisma } from '../../config/database';
import { PaymentStatus } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { NotFoundError } from '../../shared/errors';
import { Request } from 'express';
import type { paymentQuerySchema } from './payments.schema';
import { z } from 'zod';

type PaymentQuery = z.infer<typeof paymentQuerySchema>;

export async function listPayments(query: PaymentQuery, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'amount', 'status', 'paidAt'], 'createdAt');
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.customerId) where.customerId = query.customerId;
  if (query.q) where.razorpayPaymentId = { contains: query.q };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where, orderBy: { [sort.field]: sort.direction },
      skip: pagination.skip, take: pagination.limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        booking: { select: { id: true, roomName: true, checkIn: true, checkOut: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      customer: true,
      booking: { include: { statusHistory: { take: 5, orderBy: { createdAt: 'desc' } } } },
      refunds: true,
    },
  });
  if (!payment) throw new NotFoundError('Payment');
  return payment;
}

export async function getPaymentStats() {
  const [byStatus, totalRevenue] = await Promise.all([
    prisma.payment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: PaymentStatus.PAID }, _sum: { amount: true } }),
  ]);
  return { byStatus, totalRevenue: Number(totalRevenue._sum.amount ?? 0) };
}
