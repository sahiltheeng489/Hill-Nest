import { Request, Response, NextFunction } from 'express';
import { getHealthStatus, getSystemMetrics } from './monitoring.service';
import { sendSuccess } from '../../shared/response';

export async function health(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getHealthStatus()); } catch(e){next(e);}
}
export async function metrics(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getSystemMetrics()); } catch(e){next(e);}
}
