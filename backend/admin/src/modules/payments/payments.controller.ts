import { Request, Response, NextFunction } from 'express';
import { listPayments, getPaymentById, getPaymentStats } from './payments.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listPayments(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getPaymentById(req.params.id)); } catch(e){next(e);}
}
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getPaymentStats()); } catch(e){next(e);}
}
