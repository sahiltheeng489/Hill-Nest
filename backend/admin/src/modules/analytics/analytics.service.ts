import { prisma } from '../../config/database';
import { PaymentStatus } from '@prisma/client';
import { Parser } from 'json2csv';

export async function getRevenueReport(from?: Date, to?: Date) {
  const where: Record<string, unknown> = { status: PaymentStatus.PAID };
  if (from || to) where.paidAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

  const [payments, total, avg] = await Promise.all([
    prisma.payment.findMany({ where, orderBy: { paidAt: 'asc' }, select: { amount: true, paidAt: true, currency: true } }),
    prisma.payment.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }),
    prisma.payment.aggregate({ where, _avg: { amount: true } }),
  ]);

  const byDay = new Map<string, number>();
  for (const p of payments) {
    if (p.paidAt) {
      const day = p.paidAt.toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) ?? 0) + Number(p.amount));
    }
  }

  return {
    total: Number(total._sum.amount ?? 0),
    count: total._count._all,
    average: Number(avg._avg.amount ?? 0),
    byDay: Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue })),
  };
}

export async function getBookingsReport(from?: Date, to?: Date) {
  const where: Record<string, unknown> = {};
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

  const [byStatus, total] = await Promise.all([
    prisma.booking.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.booking.count({ where }),
  ]);

  return { total, byStatus: byStatus.map(b => ({ status: b.status, count: b._count._all })) };
}

export async function getCustomersReport(from?: Date, to?: Date) {
  const where: Record<string, unknown> = {};
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  const total = await prisma.customer.count({ where });
  return { total };
}

export async function getRefundsReport(from?: Date, to?: Date) {
  const where: Record<string, unknown> = {};
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  const [byStatus, total] = await Promise.all([
    prisma.refund.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { amount: true } }),
    prisma.refund.aggregate({ where, _sum: { amount: true } }),
  ]);
  return { totalAmount: Number(total._sum.amount ?? 0), byStatus: byStatus.map(r => ({ status: r.status, count: r._count._all, amount: Number(r._sum.amount ?? 0) })) };
}

export async function exportData(type: string, format: string, from?: Date, to?: Date): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
  let data: Record<string, unknown>[] = [];

  if (type === 'revenue') {
    const report = await getRevenueReport(from, to);
    data = report.byDay;
  } else if (type === 'bookings') {
    const bookings = await prisma.booking.findMany({
      where: from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {},
      include: { customer: { select: { name: true, email: true } } },
    });
    data = bookings.map(b => ({ id: b.id, customer: b.customer.name, email: b.customer.email, room: b.roomName, checkIn: b.checkIn, checkOut: b.checkOut, amount: Number(b.totalAmount), status: b.status, createdAt: b.createdAt }));
  } else if (type === 'customers') {
    const customers = await prisma.customer.findMany({ where: from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {} });
    data = customers.map(c => ({ id: c.id, name: c.name, email: c.email, status: c.status, bookings: c.totalBookings, spent: Number(c.totalSpent), joined: c.createdAt }));
  } else if (type === 'refunds') {
    const refunds = await prisma.refund.findMany({ where: from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}, include: { booking: { select: { roomName: true } } } });
    data = refunds.map(r => ({ id: r.id, booking: r.booking.roomName, type: r.type, amount: Number(r.amount), reason: r.reason, status: r.status, createdAt: r.createdAt }));
  }

  if (format === 'csv' || format === 'excel') {
    const parser = new Parser();
    const csv = parser.parse(data);
    return { buffer: Buffer.from(csv), contentType: 'text/csv', filename: `${type}-export-${Date.now()}.csv` };
  } else {
    const text = `HillNest Export: ${type}\nGenerated: ${new Date().toISOString()}\n\n${data.map(r => JSON.stringify(r)).join('\n')}`;
    return { buffer: Buffer.from(text), contentType: 'text/plain', filename: `${type}-export-${Date.now()}.txt` };
  }
}
