import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { list, getById, create, updatePermissions, allPermissions } from './roles.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('roles:read'), list);
router.get('/permissions', authorize('roles:read'), allPermissions);
router.get('/:id', authorize('roles:read'), getById);
router.post('/', authorize('roles:write'), create);
router.put('/:id/permissions', authorize('roles:write'), updatePermissions);
export default router;
