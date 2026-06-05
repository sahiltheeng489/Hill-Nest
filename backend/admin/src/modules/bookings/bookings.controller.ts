import { Request, Response, NextFunction } from 'express';
import { listBookings, getBookingById, updateBookingStatus, cancelBooking, rescheduleBooking } from './bookings.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listBookings(req.query as any, req);
    sendPaginated(res, result.items, result.pagination);
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await getBookingById(req.params.id));
  } catch (e) { next(e); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await updateBookingStatus(req.params.id, req.adminUser.id, req.body.status, req.body.reason));
  } catch (e) { next(e); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await cancelBooking(req.params.id, req.adminUser.id, req.body));
  } catch (e) { next(e); }
}

export async function reschedule(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await rescheduleBooking(req.params.id, req.adminUser.id, req.body));
  } catch (e) { next(e); }
}
