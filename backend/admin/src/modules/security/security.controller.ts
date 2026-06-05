import { Request, Response, NextFunction } from 'express';
import { getActiveSessions, revokeSession, revokeAllUserSessions, getFailedLogins, getSuspiciousActivity, getBlockedIps, blockIp, unblockIp } from './security.service';
import { sendSuccess, sendPaginated, sendNoContent } from '../../shared/response';

export async function sessions(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getActiveSessions(req.query.userId as string)); } catch(e){next(e);}
}
export async function revokeOne(req: Request, res: Response, next: NextFunction) {
  try { await revokeSession(req.params.id, req.adminUser.id); sendNoContent(res); } catch(e){next(e);}
}
export async function revokeAll(req: Request, res: Response, next: NextFunction) {
  try { await revokeAllUserSessions(req.params.userId, req.adminUser.id); sendNoContent(res); } catch(e){next(e);}
}
export async function failedLogins(req: Request, res: Response, next: NextFunction) {
  try { const r = await getFailedLogins(req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function suspicious(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getSuspiciousActivity()); } catch(e){next(e);}
}
export async function blockedIps(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getBlockedIps()); } catch(e){next(e);}
}
export async function block(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await blockIp(req.body.ipAddress, req.body.reason, req.adminUser.id, req.body.expiresAt ? new Date(req.body.expiresAt) : undefined)); } catch(e){next(e);}
}
export async function unblock(req: Request, res: Response, next: NextFunction) {
  try { await unblockIp(req.params.id, req.adminUser.id); sendNoContent(res); } catch(e){next(e);}
}
