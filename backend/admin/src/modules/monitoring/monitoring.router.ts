import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { health, metrics } from './monitoring.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/health', authorize('monitoring:read'), health);
router.get('/metrics', authorize('monitoring:read'), metrics);
export default router;
