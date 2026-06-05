import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/database';
import { getRedisClient, redisIncr, redisDel } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  NotFoundError,
} from '../../shared/errors';
import { writeAuditLog } from '../../middleware/auditLog';
import { AuditAction, UserStatus } from '@prisma/client';
import type { LoginInput, ChangePasswordInput } from './auth.schema';

const LOCKOUT_KEY = (userId: string) => `admin:lockout:${userId}`;
const FAILED_ATTEMPTS_KEY = (email: string) => `admin:failed:${email}`;
const REFRESH_COOKIE_NAME = 'admin_refresh_token';

// ── Token generation ─────────────────────────────────────────

function generateAccessToken(userId: string, email: string, sessionId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(
    { sub: userId, email, sessionId },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
    }
  ) as string;
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

// ── MFA Encryption helpers ───────────────────────────────────

function encryptSecret(plaintext: string): string {
  const key = Buffer.from(env.MFA_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptSecret(ciphertext: string): string {
  const [ivHex, encHex] = ciphertext.split(':');
  const key = Buffer.from(env.MFA_ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

// ── Login ────────────────────────────────────────────────────

export async function loginService(
  input: LoginInput,
  ipAddress: string,
  userAgent: string
): Promise<{ accessToken: string; refreshToken: string; user: object; requiresMfa: boolean }> {
  const { email, password, mfaCode } = input;

  // Check if IP is blocked
  const blockedIp = await prisma.blockedIp.findFirst({
    where: { ipAddress, isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  });
  if (blockedIp) {
    throw new ForbiddenError('Your IP address has been blocked. Contact support.', 'IP_BLOCKED');
  }

  // Find user
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    // Record failed attempt without exposing that user doesn't exist
    await recordFailedAttempt(email, ipAddress, userAgent, null, 'USER_NOT_FOUND');
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check account status
  if (user.status === UserStatus.SUSPENDED) {
    throw new ForbiddenError('Account suspended. Contact an administrator.', 'ACCOUNT_SUSPENDED');
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new ForbiddenError(
      `Account locked. Try again in ${minutesLeft} minute(s).`,
      'ACCOUNT_LOCKED'
    );
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    await recordFailedAttempt(email, ipAddress, userAgent, user.id, 'INVALID_PASSWORD');

    // Increment failed attempts and potentially lock account
    const attempts = await redisIncr(
      FAILED_ATTEMPTS_KEY(email),
      env.LOCKOUT_DURATION_MINUTES * 60
    );

    if (attempts >= env.MAX_FAILED_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + env.LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lockedUntil, failedLoginAttempts: attempts },
      });
      await writeAuditLog({
        adminUserId: user.id,
        action: AuditAction.LOGIN_FAILED,
        resource: 'auth',
        description: `Account locked after ${attempts} failed attempts`,
        ipAddress,
      });
      throw new ForbiddenError(
        `Account locked for ${env.LOCKOUT_DURATION_MINUTES} minutes after too many failed attempts.`,
        'ACCOUNT_LOCKED'
      );
    }

    throw new UnauthorizedError('Invalid email or password');
  }

  // MFA check
  if (user.mfaEnabled) {
    if (!mfaCode) {
      return { accessToken: '', refreshToken: '', user: {}, requiresMfa: true };
    }

    const mfaSecret = await prisma.mfaSecret.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!mfaSecret) {
      throw new UnauthorizedError('MFA configuration error. Contact support.');
    }

    const decryptedSecret = decryptSecret(mfaSecret.secret);
    const isValidCode = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: mfaCode,
      window: 1, // allow 30-second window on each side
    });

    if (!isValidCode) {
      await recordFailedAttempt(email, ipAddress, userAgent, user.id, 'INVALID_MFA_CODE');
      throw new UnauthorizedError('Invalid MFA code');
    }
  }

  // Clear failed attempts on success
  await redisDel(FAILED_ATTEMPTS_KEY(email));

  // Create session
  const sessionId = uuidv4();
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = await hashToken(rawRefreshToken);

  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7);

  // Parse device info
  const deviceInfo = parseDeviceInfo(userAgent);

  await prisma.adminSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshToken: hashedRefreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt: refreshExpiry,
    },
  });

  // Update user login metadata
  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const accessToken = generateAccessToken(user.id, user.email, sessionId);

  await writeAuditLog({
    adminUserId: user.id,
    action: AuditAction.LOGIN,
    resource: 'auth',
    description: 'Admin user logged in',
    ipAddress,
    userAgent,
  });

  const { passwordHash: _ph, ...safeUser } = user;

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: safeUser,
    requiresMfa: false,
  };
}

// ── Refresh Token Rotation ───────────────────────────────────

export async function refreshTokenService(
  rawRefreshToken: string,
  ipAddress: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Find matching session (we need to compare hashes)
  const sessions = await prisma.adminSession.findMany({
    where: {
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
    take: 50, // safety limit — in production index on token hash
  });

  let matchedSession = null;
  for (const session of sessions) {
    const match = await bcrypt.compare(rawRefreshToken, session.refreshToken);
    if (match) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  if (matchedSession.user.status !== UserStatus.ACTIVE) {
    await prisma.adminSession.update({
      where: { id: matchedSession.id },
      data: { isRevoked: true },
    });
    throw new UnauthorizedError('Account inactive', 'ACCOUNT_INACTIVE');
  }

  // Rotate: invalidate old, create new refresh token
  const newRawRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = await hashToken(newRawRefreshToken);
  const newSessionId = uuidv4();

  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7);

  await prisma.$transaction([
    prisma.adminSession.update({
      where: { id: matchedSession.id },
      data: { isRevoked: true },
    }),
    prisma.adminSession.create({
      data: {
        id: newSessionId,
        userId: matchedSession.userId,
        refreshToken: newHashedRefreshToken,
        deviceInfo: matchedSession.deviceInfo ?? undefined,
        ipAddress,
        userAgent: matchedSession.userAgent,
        expiresAt: refreshExpiry,
      },
    }),
  ]);

  const newAccessToken = generateAccessToken(
    matchedSession.userId,
    matchedSession.user.email,
    newSessionId
  );

  return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
}

// ── Logout ───────────────────────────────────────────────────

export async function logoutService(userId: string, sessionId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { id: sessionId, userId },
    data: { isRevoked: true },
  });

  await writeAuditLog({
    adminUserId: userId,
    action: AuditAction.LOGOUT,
    resource: 'auth',
    description: 'Admin user logged out',
  });
}

// ── MFA Setup ────────────────────────────────────────────────

export async function setupMfaService(userId: string): Promise<{ qrCodeUrl: string; secret: string }> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const secret = speakeasy.generateSecret({
    name: `${env.MFA_APP_NAME} (${user.email})`,
    length: 32,
  });

  if (!secret.base32 || !secret.otpauth_url) {
    throw new Error('Failed to generate MFA secret');
  }

  const encryptedSecret = encryptSecret(secret.base32);

  // Store as inactive until verified
  await prisma.mfaSecret.deleteMany({ where: { userId, isActive: false } });
  await prisma.mfaSecret.create({
    data: { userId, secret: encryptedSecret, isActive: false },
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return { qrCodeUrl, secret: secret.base32 };
}

export async function verifyMfaSetupService(userId: string, code: string): Promise<void> {
  const mfaSecret = await prisma.mfaSecret.findFirst({
    where: { userId, isActive: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!mfaSecret) throw new BadRequestError('No pending MFA setup found');

  const decryptedSecret = decryptSecret(mfaSecret.secret);
  const isValid = speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  if (!isValid) throw new UnauthorizedError('Invalid MFA code', 'INVALID_MFA_CODE');

  await prisma.$transaction([
    prisma.mfaSecret.updateMany({ where: { userId }, data: { isActive: false } }),
    prisma.mfaSecret.update({ where: { id: mfaSecret.id }, data: { isActive: true } }),
    prisma.adminUser.update({ where: { id: userId }, data: { mfaEnabled: true } }),
  ]);

  await writeAuditLog({
    adminUserId: userId,
    action: AuditAction.MFA_ENABLED,
    resource: 'auth',
    description: 'MFA enabled for admin user',
  });
}

export async function disableMfaService(userId: string, password: string): Promise<void> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid password');

  await prisma.$transaction([
    prisma.mfaSecret.deleteMany({ where: { userId } }),
    prisma.adminUser.update({ where: { id: userId }, data: { mfaEnabled: false } }),
  ]);

  await writeAuditLog({
    adminUserId: userId,
    action: AuditAction.MFA_DISABLED,
    resource: 'auth',
    description: 'MFA disabled for admin user',
  });
}

// ── Change Password ──────────────────────────────────────────

export async function changePasswordService(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Current password is incorrect');

  const newHash = await bcrypt.hash(input.newPassword, 12);

  await prisma.$transaction([
    prisma.adminUser.update({ where: { id: userId }, data: { passwordHash: newHash } }),
    // Revoke all sessions on password change
    prisma.adminSession.updateMany({ where: { userId }, data: { isRevoked: true } }),
  ]);

  await writeAuditLog({
    adminUserId: userId,
    action: AuditAction.PASSWORD_CHANGE,
    resource: 'auth',
    description: 'Admin user changed password — all sessions revoked',
  });
}

// ── Helpers ──────────────────────────────────────────────────

async function recordFailedAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  userId: string | null,
  reason: string
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { userId, email, ipAddress, userAgent, success: false, reason },
  }).catch(() => {}); // fire-and-forget
}

function parseDeviceInfo(userAgent: string): Record<string, string> {
  // Basic UA parsing without a heavy library dependency
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] ?? 'Unknown';
  const os = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)[/\s]?([\d_.]+)?/)?.[1] ?? 'Unknown';
  return { browser, os };
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/admin/auth',
};
