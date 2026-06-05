import { PrismaClient, AuditAction, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Permissions ────────────────────────────────────────────────
  const permissionDefs = [
    { resource: 'dashboard', action: 'read' },
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'write' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'write' },
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'write' },
    { resource: 'refunds', action: 'read' },
    { resource: 'refunds', action: 'approve' },
    { resource: 'refunds', action: 'write' },
    { resource: 'tickets', action: 'read' },
    { resource: 'tickets', action: 'write' },
    { resource: 'cms', action: 'read' },
    { resource: 'cms', action: 'write' },
    { resource: 'analytics', action: 'read' },
    { resource: 'analytics', action: 'export' },
    { resource: 'security', action: 'read' },
    { resource: 'security', action: 'write' },
    { resource: 'monitoring', action: 'read' },
    { resource: 'notifications', action: 'read' },
    { resource: 'notifications', action: 'write' },
    { resource: 'roles', action: 'read' },
    { resource: 'roles', action: 'write' },
    { resource: 'admin', action: 'super' }, // Super admin wildcard
  ];

  console.log('  Creating permissions...');
  const permissions = await Promise.all(
    permissionDefs.map((p) =>
      prisma.permission.upsert({
        where: { resource_action: p },
        update: {},
        create: { ...p, description: `${p.action} access to ${p.resource}` },
      })
    )
  );

  const permMap = new Map(permissions.map((p) => [`${p.resource}:${p.action}`, p.id]));

  // ── Roles ──────────────────────────────────────────────────────
  const roleDefinitions = [
    {
      name: 'Super Admin',
      description: 'Full access to all features',
      isSystem: true,
      permissions: ['admin:super'],
    },
    {
      name: 'Admin',
      description: 'Manage bookings, customers, and payments',
      isSystem: true,
      permissions: [
        'dashboard:read', 'bookings:read', 'bookings:write',
        'customers:read', 'customers:write',
        'payments:read', 'payments:write',
        'refunds:read', 'refunds:approve', 'refunds:write',
        'tickets:read', 'tickets:write',
        'analytics:read', 'notifications:read',
      ],
    },
    {
      name: 'Finance Manager',
      description: 'Handle refunds and revenue reports',
      isSystem: true,
      permissions: [
        'dashboard:read', 'payments:read',
        'refunds:read', 'refunds:approve', 'refunds:write',
        'analytics:read', 'analytics:export',
      ],
    },
    {
      name: 'Support Agent',
      description: 'Handle support tickets and customer queries',
      isSystem: true,
      permissions: [
        'dashboard:read', 'tickets:read', 'tickets:write',
        'customers:read', 'bookings:read',
      ],
    },
    {
      name: 'Moderator',
      description: 'Manage content and CMS pages',
      isSystem: true,
      permissions: ['dashboard:read', 'cms:read', 'cms:write'],
    },
  ];

  console.log('  Creating roles...');
  const roles: Record<string, string> = {};
  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem },
    });
    roles[roleDef.name] = role.id;

    // Assign permissions
    for (const permKey of roleDef.permissions) {
      const permId = permMap.get(permKey);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  // ── Super Admin User ───────────────────────────────────────────
  console.log('  Creating super admin user...');
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? 'admin@123';
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@hillnest.in' },
    update: {},
    create: {
      email: 'admin@hillnest.in',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      mfaEnabled: false,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: roles['Super Admin'] } },
    update: {},
    create: { userId: superAdmin.id, roleId: roles['Super Admin'] },
  });

  // Seed Admin user
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'AdminPass@123';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'somadmin@hillnest.in' },
    update: {},
    create: {
      email: 'somadmin@hillnest.in',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'User',
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: roles['Admin'] } },
    update: {},
    create: { userId: adminUser.id, roleId: roles['Admin'] },
  });

  // ── System Settings ────────────────────────────────────────────
  console.log('  Creating system settings...');
  const settings = [
    { key: 'site.name', value: 'HillNest Homestay', description: 'Site display name' },
    { key: 'site.currency', value: 'INR', description: 'Default currency' },
    { key: 'booking.max_guests', value: '10', description: 'Maximum guests per booking' },
    { key: 'refund.auto_approve_threshold', value: '500', description: 'Auto-approve refunds below this amount (INR)' },
    { key: 'security.session_timeout_hours', value: '24', description: 'Admin session timeout' },
    { key: 'notification.email_enabled', value: 'true', description: 'Enable email notifications' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // ── Sample Data (for development) ─────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.log('  Seeding sample data (dev only)...');

    // Sample customers
    const sampleCustomers = [
      { email: 'arjun.sharma@example.com', name: 'Arjun Sharma', phone: '+91 98765 43210', totalBookings: 3, totalSpent: 15000 },
      { email: 'priya.nair@example.com', name: 'Priya Nair', phone: '+91 87654 32109', totalBookings: 1, totalSpent: 4500 },
      { email: 'rahul.verma@example.com', name: 'Rahul Verma', phone: '+91 76543 21098', totalBookings: 2, totalSpent: 9000 },
      { email: 'ananya.das@example.com', name: 'Ananya Das', totalBookings: 0, totalSpent: 0 },
      { email: 'kiran.mehta@example.com', name: 'Kiran Mehta', phone: '+91 65432 10987', totalBookings: 5, totalSpent: 28000 },
    ];

    const createdCustomers = [];
    for (const c of sampleCustomers) {
      const customer = await prisma.customer.upsert({
        where: { email: c.email },
        update: {},
        create: { ...c, emailVerified: true, totalSpent: c.totalSpent },
      });
      createdCustomers.push(customer);
    }

    // Sample bookings
    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
    for (let i = 0; i < 10; i++) {
      const customer = createdCustomers[i % createdCustomers.length];
      const checkIn = new Date(Date.now() + (i - 5) * 24 * 60 * 60 * 1000);
      const checkOut = new Date(checkIn.getTime() + (2 + i % 3) * 24 * 60 * 60 * 1000);
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));
      const pricePerNight = 2500 + (i % 3) * 500;

      await prisma.booking.upsert({
        where: { mongoId: `sample_booking_${i}` },
        update: {},
        create: {
          mongoId: `sample_booking_${i}`,
          customerId: customer.id,
          roomName: `Room ${101 + i}`,
          roomType: i % 2 === 0 ? 'Deluxe' : 'Standard',
          checkIn,
          checkOut,
          guests: 1 + (i % 3),
          nights,
          pricePerNight,
          totalAmount: pricePerNight * nights,
          status: statuses[i % statuses.length],
        },
      });
    }

    // Sample tickets
    const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;
    for (let i = 0; i < 5; i++) {
      await prisma.ticket.create({
        data: {
          customerId: createdCustomers[i % createdCustomers.length].id,
          subject: `Issue with booking #10${i}`,
          description: `Customer is having an issue with their booking. Need to investigate and resolve.`,
          status: ticketStatuses[i % ticketStatuses.length],
          priority: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
          category: 'booking',
        },
      });
    }
  }

  // Initial audit log entry
  await prisma.auditLog.create({
    data: {
      adminUserId: superAdmin.id,
      action: AuditAction.CREATE,
      resource: 'system',
      description: 'System initialized — seed data applied',
      metadata: { version: '1.0.0', env: process.env.NODE_ENV },
    },
  });

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Admin credentials:');
  console.log('   Super Admin: somadmin@hillnest.in');
  console.log('   Admin:       admin@hillnest.in');
  console.log('\n⚠️  Change these passwords immediately in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
