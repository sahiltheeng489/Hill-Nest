import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(6).optional(),
  rememberMe: z.boolean().optional().default(false),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});

export const mfaSetupVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits').regex(/^\d+$/, 'MFA code must be numeric'),
});

export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits').regex(/^\d+$/, 'MFA code must be numeric'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type MfaSetupVerifyInput = z.infer<typeof mfaSetupVerifySchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
