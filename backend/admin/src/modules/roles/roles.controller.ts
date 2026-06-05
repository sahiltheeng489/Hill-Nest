import { Request, Response, NextFunction } from 'express';
import { listRoles, getRoleById, createRole, updateRolePermissions, listAllPermissions } from './roles.service';
import { sendSuccess, sendCreated } from '../../shared/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listRoles()); } catch(e){next(e);}
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getRoleById(req.params.id)); } catch(e){next(e);}
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { sendCreated(res, await createRole(req.body.name, req.body.description)); } catch(e){next(e);}
}
export async function updatePermissions(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateRolePermissions(req.params.id, req.body.permissionIds, req.adminUser.id)); } catch(e){next(e);}
}
export async function allPermissions(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listAllPermissions()); } catch(e){next(e);}
}
