import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import { AuditAction } from '@prisma/client';
import { updateBookingStatusSchema, cancelBookingSchema, rescheduleBookingSchema } from './bookings.schema';
import { list, getById, updateStatus, cancel, reschedule } from './bookings.controller';

const router: import('express').Router = Router();
router.use(authenticate);

router.get('/', authorize('bookings:read'), list);
router.get('/:id', authorize('bookings:read'), getById);

router.patch('/:id/status',
  authorize('bookings:write'),
  validate(updateBookingStatusSchema),
  auditLog({ action: AuditAction.BOOKING_STATUS_CHANGED, resource: 'booking', getResourceId: (req) => req.params.id }),
  updateStatus
);

router.post('/:id/cancel',
  authorize('bookings:write'),
  validate(cancelBookingSchema),
  auditLog({ action: AuditAction.BOOKING_STATUS_CHANGED, resource: 'booking', getResourceId: (req) => req.params.id }),
  cancel
);

router.post('/:id/reschedule',
  authorize('bookings:write'),
  validate(rescheduleBookingSchema),
  auditLog({ action: AuditAction.UPDATE, resource: 'booking', getResourceId: (req) => req.params.id }),
  reschedule
);

export default router;
