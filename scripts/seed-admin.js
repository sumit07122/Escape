const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@glaescape.in').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!adminPassword) throw new Error('Set ADMIN_DEFAULT_PASSWORD before running the admin seed.');

  console.log(`Ensuring Admin exists in Supabase PostgreSQL for: ${adminEmail}...`);

  // 1. Ensure in User table with role ADMIN
  const userAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      name: 'Lead Coordinator',
    },
    create: {
      email: adminEmail,
      name: 'Lead Coordinator',
      role: 'ADMIN',
    },
  });
  console.log(`✔ User record ensured: ${userAdmin.id} (${userAdmin.email}, role: ${userAdmin.role})`);

  // 2. Ensure in Admin table with passwordHash
  const adminRecord = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Lead Coordinator',
      role: 'SUPER_ADMIN',
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      email: adminEmail,
      name: 'Lead Coordinator',
      role: 'SUPER_ADMIN',
      passwordHash: hashPassword(adminPassword),
    },
  });
  console.log(`✔ Admin record ensured: ${adminRecord.id} (${adminRecord.email}, role: ${adminRecord.role})`);

  console.log('✅ Admin credentials successfully synchronized with database!');
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
