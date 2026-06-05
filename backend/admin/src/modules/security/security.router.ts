import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { sessions, revokeOne, revokeAll, failedLogins, suspicious, blockedIps, block, unblock } from './security.controller';

const router: import('express').Router = Router();
router.use(authenticate);
router.get('/sessions', authorize('security:read'), sessions);
router.delete('/sessions/:id', authorize('security:write'), revokeOne);
router.delete('/sessions/user/:userId', authorize('security:write'), revokeAll);
router.get('/failed-logins', authorize('security:read'), failedLogins);
router.get('/suspicious', authorize('security:read'), suspicious);
router.get('/blocked-ips', authorize('security:read'), blockedIps);
router.post('/block-ip', authorize('security:write'), block);
router.delete('/blocked-ips/:id', authorize('security:write'), unblock);
export default router;
