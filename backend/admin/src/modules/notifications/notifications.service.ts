import { prisma } from '../../config/database';
import { AuditAction, NotificationChannel, NotificationStatus } from '@prisma/client';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError } from '../../shared/errors';
import { logger } from '../../config/logger';
import { Request } from 'express';

export async function listNotifications(query: Record<string, unknown>, req: Request) {
  const pagination = parsePagination(req);
  const where: Record<string, unknown> = {};
  if (query.channel) where.channel = query.channel;
  if (query.status) where.status = query.status;
  if (query.customerId) where.customerId = query.customerId;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.limit, include: { customer: { select: { name: true, email: true } } } }),
    prisma.notification.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getNotificationById(id: string) {
  const n = await prisma.notification.findUnique({ where: { id }, include: { customer: { select: { name: true, email: true } } } });
  if (!n) throw new NotFoundError('Notification');
  return n;
}

export async function sendNotification(input: { customerId?: string; channel: NotificationChannel; subject?: string; body: string; recipientRef: string }, adminId: string) {
  // Simulate sending — in production, call the appropriate provider
  logger.info(`[Notification] Sending ${input.channel} to ${input.recipientRef}: ${input.subject ?? 'No subject'}`);

  const notification = await prisma.notification.create({
    data: {
      ...input,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      sentBy: adminId,
    },
  });

  await writeAuditLog({ adminUserId: adminId, action: AuditAction.CREATE, resource: 'notification', resourceId: notification.id, description: `Sent ${input.channel} notification to ${input.recipientRef}` });
  return notification;
}

export async function getNotificationStats() {
  const [byChannel, byStatus] = await Promise.all([
    prisma.notification.groupBy({ by: ['channel'], _count: { _all: true } }),
    prisma.notification.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  return { byChannel, byStatus };
}
