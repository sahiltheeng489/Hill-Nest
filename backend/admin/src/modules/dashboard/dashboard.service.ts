import { prisma } from '../../config/database';
import { BookingStatus, PaymentStatus, RefundStatus, TicketStatus } from '@prisma/client';
import { getRedisClient } from '../../config/redis';

const STATS_CACHE_KEY = 'admin:dashboard:stats';
const CACHE_TTL = 300; // 5 minutes

export async function getDashboardStats() {
  const redis = getRedisClient();
  const cached = await redis.get(STATS_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalBookings,
    bookingsThisMonth,
    bookingsPrevMonth,
    totalRevenue,
    revenueThisMonth,
    revenuePrevMonth,
    totalCustomers,
    newCustomersThisMonth,
    failedPayments,
    pendingRefunds,
    openTickets,
    recentBookings,
    recentActivity,
    revenueByDay,
    bookingsByStatus,
    customerGrowth,
  ] = await Promise.all([
    // Total bookings
    prisma.booking.count(),

    // Bookings this month
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Bookings prev month
    prisma.booking.count({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),

    // Total revenue (paid payments)
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
    }),

    // Revenue this month
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID, paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),

    // Revenue prev month
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID, paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),

    // Total customers
    prisma.customer.count(),

    // New customers this month
    prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Failed payments
    prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),

    // Pending refunds
    prisma.refund.count({ where: { status: RefundStatus.PENDING } }),

    // Open tickets
    prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),

    // Recent bookings
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true, email: true } } },
    }),

    // Recent audit log activity
    prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { adminUser: { select: { firstName: true, lastName: true, email: true } } },
    }),

    // Revenue by day (last 30 days) for chart
    prisma.payment.groupBy({
      by: ['paidAt'],
      where: { status: PaymentStatus.PAID, paidAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),

    // Bookings by status
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),

    // Customer growth (last 7 days by day)
    prisma.customer.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    }),
  ]);

  // Calculate % changes
  const bookingChange = calcPercentChange(bookingsPrevMonth, bookingsThisMonth);
  const revenueChange = calcPercentChange(
    Number(revenuePrevMonth._sum.amount ?? 0),
    Number(revenueThisMonth._sum.amount ?? 0)
  );

  const stats = {
    overview: {
      totalBookings,
      bookingsThisMonth,
      bookingChange,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      revenueThisMonth: Number(revenueThisMonth._sum.amount ?? 0),
      revenueChange,
      totalCustomers,
      newCustomersThisMonth,
      failedPayments,
      pendingRefunds,
      openTickets,
    },
    recentBookings,
    recentActivity,
    charts: {
      revenueByDay: aggregateByDay(revenueByDay),
      bookingsByStatus: bookingsByStatus.map((b) => ({
        status: b.status,
        count: b._count._all,
      })),
      customerGrowth: aggregateByDay(customerGrowth),
    },
    generatedAt: new Date().toISOString(),
  };

  await redis.setex(STATS_CACHE_KEY, CACHE_TTL, JSON.stringify(stats));
  return stats;
}

function calcPercentChange(prev: number, curr: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function aggregateByDay(records: Array<{ [key: string]: unknown }>): Array<{ date: string; value: number }> {
  const dayMap = new Map<string, number>();
  for (const record of records) {
    const date = Object.values(record).find((v) => v instanceof Date) as Date | undefined;
    if (!date) continue;
    const day = date.toISOString().split('T')[0];
    const value = (record._sum as { amount?: number })?.amount ??
                  (record._count as { _all?: number })?._all ?? 0;
    dayMap.set(day, (dayMap.get(day) ?? 0) + Number(value));
  }
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}
