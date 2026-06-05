import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { list, getById, assign, note, updateStatus, escalate } from './tickets.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('tickets:read'), list);
router.get('/:id', authorize('tickets:read'), getById);
router.post('/:id/assign', authorize('tickets:write'), assign);
router.post('/:id/notes', authorize('tickets:write'), note);
router.patch('/:id/status', authorize('tickets:write'), updateStatus);
router.post('/:id/escalate', authorize('tickets:write'), escalate);
export default router;
