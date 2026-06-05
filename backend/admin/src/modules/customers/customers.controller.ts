import { Request, Response, NextFunction } from 'express';
import { listCustomers, getCustomerById, updateCustomerStatus, updateCustomerNotes } from './customers.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listCustomers(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch (e) { next(e); }
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getCustomerById(req.params.id)); } catch (e) { next(e); }
}
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateCustomerStatus(req.params.id, req.adminUser.id, req.body)); } catch (e) { next(e); }
}
export async function updateNotes(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateCustomerNotes(req.params.id, req.body.notes)); } catch (e) { next(e); }
}
