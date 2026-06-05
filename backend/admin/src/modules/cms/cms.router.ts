import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { list, getById, create, update, publish, archive } from './cms.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('cms:read'), list);
router.get('/:id', authorize('cms:read'), getById);
router.post('/', authorize('cms:write'), create);
router.put('/:id', authorize('cms:write'), update);
router.post('/:id/publish', authorize('cms:write'), publish);
router.post('/:id/archive', authorize('cms:write'), archive);
export default router;
