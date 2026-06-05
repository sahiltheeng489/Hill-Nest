import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { approveRefundSchema, rejectRefundSchema, createRefundSchema } from '../payments/payments.schema';
import { list, getById, approve, reject, create, stats } from './refunds.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('refunds:read'), list);
router.get('/stats', authorize('refunds:read'), stats);
router.get('/:id', authorize('refunds:read'), getById);
router.post('/', authorize('refunds:write'), validate(createRefundSchema), create);
router.post('/:id/approve', authorize('refunds:approve'), validate(approveRefundSchema), approve);
router.post('/:id/reject', authorize('refunds:approve'), validate(rejectRefundSchema), reject);
export default router;
