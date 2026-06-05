import { prisma } from '../../config/database';
import { BookingStatus, AuditAction } from '@prisma/client';
import { parsePagination, parseSort, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError, BadRequestError } from '../../shared/errors';
import type { BookingQueryInput, CancelBookingInput, RescheduleBookingInput } from './bookings.schema';
import { Request } from 'express';

export async function listBookings(query: BookingQueryInput, req: Request) {
  const pagination = parsePagination(req);
  const sort = parseSort(req, ['createdAt', 'checkIn', 'totalAmount', 'status'], 'createdAt');

  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.customerId) where.customerId = query.customerId;
  if (query.roomName) where.roomName = { contains: query.roomName, mode: 'insensitive' };
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }
  if (query.q) {
    where.OR = [
      { roomName: { contains: query.q, mode: 'insensitive' } },
      { customer: { name: { contains: query.q, mode: 'insensitive' } } },
      { customer: { email: { contains: query.q, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { [sort.field]: sort.direction },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        payment: { select: { id: true, status: true, amount: true, razorpayPaymentId: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      payment: true,
      refunds: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!booking) throw new NotFoundError('Booking');
  return booking;
}

export async function updateBookingStatus(
  id: string,
  adminId: string,
  status: BookingStatus,
  reason?: string
) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new NotFoundError('Booking');

  const now = new Date();
  const updateData: Record<string, unknown> = { status };
  if (status === BookingStatus.CONFIRMED) updateData.confirmedAt = now;
  if (status === BookingStatus.COMPLETED) updateData.completedAt = now;
  if (status === BookingStatus.CANCELLED) {
    updateData.cancelledAt = now;
    updateData.cancelledBy = adminId;
    updateData.cancelReason = reason;
  }

  const [updated] = await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: updateData }),
    prisma.bookingHistory.create({
      data: {
        bookingId: id,
        fromStatus: booking.status,
        toStatus: status,
        changedBy: adminId,
        reason,
      },
    }),
  ]);

  await writeAuditLog({
    adminUserId: adminId,
    action: AuditAction.BOOKING_STATUS_CHANGED,
    resource: 'booking',
    resourceId: id,
    description: `Booking status changed from ${booking.status} to ${status}`,
    metadata: { from: booking.status, to: status, reason },
  });

  return updated;
}

export async function cancelBooking(id: string, adminId: string, input: CancelBookingInput) {
  return updateBookingStatus(id, adminId, BookingStatus.CANCELLED, input.reason);
}

export async function rescheduleBooking(
  id: string,
  adminId: string,
  input: RescheduleBookingInput
) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new NotFoundError('Booking');

  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);

  if (checkOut <= checkIn) throw new BadRequestError('Check-out must be after check-in');

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = Number(booking.pricePerNight) * nights;

  const [updated] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { checkIn, checkOut, nights, totalAmount },
    }),
    prisma.bookingHistory.create({
      data: {
        bookingId: id,
        fromStatus: booking.status,
        toStatus: booking.status,
        changedBy: adminId,
        reason: input.reason ?? 'Rescheduled by admin',
        metadata: {
          oldCheckIn: booking.checkIn,
          oldCheckOut: booking.checkOut,
          newCheckIn: checkIn,
          newCheckOut: checkOut,
        },
      },
    }),
  ]);

  await writeAuditLog({
    adminUserId: adminId,
    action: AuditAction.UPDATE,
    resource: 'booking',
    resourceId: id,
    description: `Booking rescheduled`,
    metadata: { checkIn, checkOut, nights, totalAmount },
  });

  return updated;
}
