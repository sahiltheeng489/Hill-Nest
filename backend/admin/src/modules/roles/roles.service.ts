import { prisma } from '../../config/database';
import { AuditAction } from '@prisma/client';
import { writeAuditLog } from '../../middleware/auditLog';
import { NotFoundError, ForbiddenError } from '../../shared/errors';

export async function listRoles() {
  return prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { userRoles: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } }, userRoles: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } } } } } });
  if (!role) throw new NotFoundError('Role');
  return role;
}

export async function createRole(name: string, description?: string) {
  return prisma.role.create({ data: { name, description } });
}

export async function updateRolePermissions(roleId: string, permissionIds: string[], adminId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new NotFoundError('Role');
  if (role.isSystem && role.name === 'Super Admin') throw new ForbiddenError('Cannot modify Super Admin permissions', 'SYSTEM_ROLE_PROTECTED');

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    ...permissionIds.map((permissionId) => prisma.rolePermission.create({ data: { roleId, permissionId } })),
  ]);

  await writeAuditLog({ adminUserId: adminId, action: AuditAction.UPDATE, resource: 'role', resourceId: roleId, description: `Role permissions updated for "${role.name}"`, metadata: { permissionIds } });

  return getRoleById(roleId);
}

export async function listAllPermissions() {
  const permissions = await prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  const grouped: Record<string, typeof permissions> = {};
  for (const p of permissions) {
    if (!grouped[p.resource]) grouped[p.resource] = [];
    grouped[p.resource].push(p);
  }
  return grouped;
}
