import { prisma } from '../../config/database';
import { AuditAction } from '@prisma/client';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError } from '../../shared/errors';
import { Request } from 'express';

export async function getActiveSessions(userId?: string) {
  return prisma.adminSession.findMany({
    where: { isRevoked: false, expiresAt: { gt: new Date() }, ...(userId ? { userId } : {}) },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { lastUsedAt: 'desc' },
  });
}

export async function revokeSession(sessionId: string, adminId: string) {
  const session = await prisma.adminSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new NotFoundError('Session');
  await prisma.adminSession.update({ where: { id: sessionId }, data: { isRevoked: true } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.SESSION_REVOKED, resource: 'session', resourceId: sessionId, description: 'Session revoked by admin' });
}

export async function revokeAllUserSessions(userId: string, adminId: string) {
  await prisma.adminSession.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.SESSION_REVOKED, resource: 'session', description: `All sessions revoked for user ${userId}`, metadata: { targetUserId: userId } });
}

export async function getFailedLogins(req: Request) {
  const pagination = parsePagination(req);
  const [items, total] = await Promise.all([
    prisma.loginAttempt.findMany({ where: { success: false }, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.limit }),
    prisma.loginAttempt.count({ where: { success: false } }),
  ]);
  return { items, pagination: buildPaginationMeta(total, pagination) };
}

export async function getSuspiciousActivity() {
  const byIp = await prisma.loginAttempt.groupBy({ by: ['ipAddress'], where: { success: false }, _count: { _all: true }, orderBy: { _count: { ipAddress: 'desc' } }, take: 10 });
  const byEmail = await prisma.loginAttempt.groupBy({ by: ['email'], where: { success: false }, _count: { _all: true }, orderBy: { _count: { email: 'desc' } }, take: 10 });
  return { topFailedIps: byIp.map(i => ({ ip: i.ipAddress, count: i._count._all })), topTargetedEmails: byEmail.map(e => ({ email: e.email, count: e._count._all })) };
}

export async function getBlockedIps() {
  return prisma.blockedIp.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
}

export async function blockIp(ipAddress: string, reason: string, adminId: string, expiresAt?: Date) {
  const block = await prisma.blockedIp.upsert({ where: { ipAddress }, update: { isActive: true, reason, blockedBy: adminId, expiresAt }, create: { ipAddress, reason, blockedBy: adminId, expiresAt } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.IP_BLOCKED, resource: 'security', description: `IP blocked: ${ipAddress}`, metadata: { reason, expiresAt } });
  return block;
}

export async function unblockIp(id: string, adminId: string) {
  const block = await prisma.blockedIp.findUnique({ where: { id } });
  if (!block) throw new NotFoundError('Blocked IP');
  await prisma.blockedIp.update({ where: { id }, data: { isActive: false } });
  await writeAuditLog({ adminUserId: adminId, action: AuditAction.UPDATE, resource: 'security', resourceId: id, description: `IP unblocked: ${block.ipAddress}` });
}
