import { Request, Response, NextFunction } from 'express';
import { listPages, getPageById, createPage, updatePage, publishPage, archivePage } from './cms.service';
import { sendSuccess, sendPaginated, sendCreated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { const r = await listPages(req.query as any, req); sendPaginated(res, r.items, r.pagination); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getPageById(req.params.id)); } catch(e){next(e);}
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { sendCreated(res, await createPage(req.body, req.adminUser.id)); } catch(e){next(e);}
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updatePage(req.params.id, req.body, req.adminUser.id)); } catch(e){next(e);}
}
export async function publish(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await publishPage(req.params.id, req.adminUser.id)); } catch(e){next(e);}
}
export async function archive(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await archivePage(req.params.id, req.adminUser.id)); } catch(e){next(e);}
}
