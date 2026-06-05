import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { list, getById, send, stats } from './notifications.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('notifications:read'), list);
router.get('/stats', authorize('notifications:read'), stats);
router.get('/:id', authorize('notifications:read'), getById);
router.post('/', authorize('notifications:write'), send);
export default router;
