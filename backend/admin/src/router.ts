import { Router } from 'express';
import authRouter from './modules/auth/auth.router';
import dashboardRouter from './modules/dashboard/dashboard.router';
import bookingsRouter from './modules/bookings/bookings.router';
import customersRouter from './modules/customers/customers.router';
import paymentsRouter from './modules/payments/payments.router';
import refundsRouter from './modules/refunds/refunds.router';
import ticketsRouter from './modules/tickets/tickets.router';
import cmsRouter from './modules/cms/cms.router';
import rolesRouter from './modules/roles/roles.router';
import analyticsRouter from './modules/analytics/analytics.router';
import securityRouter from './modules/security/security.router';
import monitoringRouter from './modules/monitoring/monitoring.router';
import notificationsRouter from './modules/notifications/notifications.router';

const router: import('express').Router = Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/bookings', bookingsRouter);
router.use('/customers', customersRouter);
router.use('/payments', paymentsRouter);
router.use('/refunds', refundsRouter);
router.use('/tickets', ticketsRouter);
router.use('/cms', cmsRouter);
router.use('/roles', rolesRouter);
router.use('/analytics', analyticsRouter);
router.use('/security', securityRouter);
router.use('/monitoring', monitoringRouter);
router.use('/notifications', notificationsRouter);

export default router;
