import { Request, Response, NextFunction } from 'express';
import { listRefunds, getRefundById, approveRefund, rejectRefund, createRefund, getRefundStats } from './refunds.service';
import { sendSuccess, sendPaginated, sendCreated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listRefunds(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getRefundById(req.params.id)); } catch(e){next(e);}
}
export async function approve(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await approveRefund(req.params.id, req.adminUser.id, req.body.adminNotes)); } catch(e){next(e);}
}
export async function reject(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await rejectRefund(req.params.id, req.adminUser.id, req.body.adminNotes)); } catch(e){next(e);}
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { sendCreated(res, await createRefund(req.body, req.adminUser.id)); } catch(e){next(e);}
}
export async function stats(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getRefundStats()); } catch(e){next(e);}
}
