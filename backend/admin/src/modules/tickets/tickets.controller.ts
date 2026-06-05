import { Request, Response, NextFunction } from 'express';
import { listTickets, getTicketById, assignTicket, addNote, updateTicketStatus, escalateTicket } from './tickets.service';
import { sendSuccess, sendPaginated, sendCreated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listTickets(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getTicketById(req.params.id)); } catch(e){next(e);}
}
export async function assign(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await assignTicket(req.params.id, req.body.assignedToId, req.adminUser.id)); } catch(e){next(e);}
}
export async function note(req: Request, res: Response, next: NextFunction) {
  try { sendCreated(res, await addNote(req.params.id, req.adminUser.id, req.body.content, req.body.isInternal ?? true)); } catch(e){next(e);}
}
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateTicketStatus(req.params.id, req.body.status, req.adminUser.id)); } catch(e){next(e);}
}
export async function escalate(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await escalateTicket(req.params.id, req.body.escalateTo, req.body.reason, req.adminUser.id)); } catch(e){next(e);}
}
