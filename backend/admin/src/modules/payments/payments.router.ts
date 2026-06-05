import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { list, getById, getStats } from './payments.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('payments:read'), list);
router.get('/stats', authorize('payments:read'), getStats);
router.get('/:id', authorize('payments:read'), getById);
export default router;
