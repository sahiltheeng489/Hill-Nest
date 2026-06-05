import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1)).min(0),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
