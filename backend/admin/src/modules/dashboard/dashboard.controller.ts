import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from './dashboard.service';
import { sendSuccess } from '../../shared/response';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await getDashboardStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}
