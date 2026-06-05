import { Request, Response, NextFunction } from 'express';
import { getRevenueReport, getBookingsReport, getCustomersReport, getRefundsReport, exportData } from './analytics.service';
import { sendSuccess } from '../../shared/response';
import { parseDateRange } from '../../shared/pagination';

export async function revenue(req: Request, res: Response, next: NextFunction) {
  try { const { from, to } = parseDateRange(req); sendSuccess(res, await getRevenueReport(from, to)); } catch(e){next(e);}
}
export async function bookingsReport(req: Request, res: Response, next: NextFunction) {
  try { const { from, to } = parseDateRange(req); sendSuccess(res, await getBookingsReport(from, to)); } catch(e){next(e);}
}
export async function customersReport(req: Request, res: Response, next: NextFunction) {
  try { const { from, to } = parseDateRange(req); sendSuccess(res, await getCustomersReport(from, to)); } catch(e){next(e);}
}
export async function refundsReport(req: Request, res: Response, next: NextFunction) {
  try { const { from, to } = parseDateRange(req); sendSuccess(res, await getRefundsReport(from, to)); } catch(e){next(e);}
}
export async function exportReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = parseDateRange(req);
    const type = (req.query.type as string) || 'revenue';
    const format = (req.query.format as string) || 'csv';
    const result = await exportData(type, format, from, to);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  } catch(e){next(e);}
}
