import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  loginSchema,
  mfaSetupVerifySchema,
  changePasswordSchema,
} from './auth.schema';
import {
  login,
  refresh,
  logout,
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  changePassword,
  getMe,
} from './auth.controller';

const router: import('express').Router = Router();

// Public routes (rate-limited)
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);

// Protected routes
router.use(authenticate);

router.post('/logout', logout);
router.get('/me', getMe);
router.post('/mfa/setup', setupMfa);
router.post('/mfa/verify-setup', validate(mfaSetupVerifySchema), verifyMfaSetup);
router.post('/mfa/disable', disableMfa);
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
