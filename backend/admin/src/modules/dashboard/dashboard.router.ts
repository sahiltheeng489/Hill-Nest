import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { getStats } from './dashboard.controller';

const router: import('express').Router = Router();
router.use(authenticate);

router.get('/stats', authorize('dashboard:read'), getStats);

export default router;
