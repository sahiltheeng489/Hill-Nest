import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateCustomerStatusSchema, updateCustomerNotesSchema } from './customers.schema';
import { list, getById, updateStatus, updateNotes } from './customers.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/', authorize('customers:read'), list);
router.get('/:id', authorize('customers:read'), getById);
router.patch('/:id/status', authorize('customers:write'), validate(updateCustomerStatusSchema), updateStatus);
router.patch('/:id/notes', authorize('customers:write'), validate(updateCustomerNotesSchema), updateNotes);
export default router;
