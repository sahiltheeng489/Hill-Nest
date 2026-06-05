import { Request, Response, NextFunction } from 'express';
import { listNotifications, getNotificationById, sendNotification, getNotificationStats } from './notifications.service';
import { sendSuccess, sendPaginated, sendCreated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listNotifications(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getNotificationById(req.params.id)); } catch(e){next(e);}
}
export async function send(req: Request, res: Response, next: NextFunction) {
  try { sendCreated(res, await sendNotification(req.body, req.adminUser.id)); } catch(e){next(e);}
}
export async function stats(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getNotificationStats()); } catch(e){next(e);}
}
