import { Request, Response, NextFunction } from 'express';
import {
  loginService,
  refreshTokenService,
  logoutService,
  setupMfaService,
  verifyMfaSetupService,
  disableMfaService,
  changePasswordService,
  REFRESH_COOKIE_OPTIONS,
} from './auth.service';
import { sendSuccess, sendNoContent } from '../../shared/response';
import { getClientIp } from '../../middleware/auditLog';
import { blacklistToken } from '../../middleware/authenticate';
import { env } from '../../config/env';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginService(
      req.body,
      getClientIp(req),
      req.get('user-agent') ?? ''
    );

    if (result.requiresMfa) {
      sendSuccess(res, { requiresMfa: true }, 200, 'MFA code required');
      return;
    }

    // Set refresh token as httpOnly cookie
    res.cookie('admin_refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(
      res,
      { accessToken: result.accessToken, user: result.user },
      200,
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken =
      req.cookies?.admin_refresh_token ??
      req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token required' } });
      return;
    }

    const tokens = await refreshTokenService(refreshToken, getClientIp(req));

    res.cookie('admin_refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    sendSuccess(res, { accessToken: tokens.accessToken }, 200, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await logoutService(req.adminUser.id, req.sessionId);

    // Blacklist the current access token for remaining TTL
    await blacklistToken(req.adminUser.id, req.sessionId, ACCESS_TOKEN_EXPIRY_SECONDS);

    res.clearCookie('admin_refresh_token', { path: '/api/admin/auth' });

    sendNoContent(res);
  } catch (err) {
    next(err);
  }
}

export async function setupMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await setupMfaService(req.adminUser.id);
    sendSuccess(res, result, 200, 'MFA setup initiated. Scan QR code and verify.');
  } catch (err) {
    next(err);
  }
}

export async function verifyMfaSetup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await verifyMfaSetupService(req.adminUser.id, req.body.code);
    sendSuccess(res, null, 200, 'MFA enabled successfully');
  } catch (err) {
    next(err);
  }
}

export async function disableMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await disableMfaService(req.adminUser.id, req.body.password);
    sendSuccess(res, null, 200, 'MFA disabled successfully');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await changePasswordService(req.adminUser.id, req.body);

    // Blacklist current token — user must re-login
    await blacklistToken(req.adminUser.id, req.sessionId, ACCESS_TOKEN_EXPIRY_SECONDS);
    res.clearCookie('admin_refresh_token', { path: '/api/admin/auth' });

    sendSuccess(res, null, 200, 'Password changed. Please log in again.');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { passwordHash: _ph, ...safeUser } = req.adminUser as any;
    sendSuccess(res, safeUser, 200);
  } catch (err) {
    next(err);
  }
}
