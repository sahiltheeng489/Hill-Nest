import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { exportRateLimiter } from '../../middleware/rateLimiter';
import { revenue, bookingsReport, customersReport, refundsReport, exportReport } from './analytics.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/revenue', authorize('analytics:read'), revenue);
router.get('/bookings-report', authorize('analytics:read'), bookingsReport);
router.get('/customers-report', authorize('analytics:read'), customersReport);
router.get('/refunds-report', authorize('analytics:read'), refundsReport);
router.get('/export', authorize('analytics:export'), exportRateLimiter, exportReport);
export default router;
