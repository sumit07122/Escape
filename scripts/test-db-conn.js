require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function test(name, url) {
  console.log(`Testing ${name}...`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const buses = await prisma.bus.findMany({ select: { id: true, busNumber: true } });
    console.log(`SUCCESS ${name}: found ${buses.length} buses:`, buses.map(b => b.busNumber).join(', '));
  } catch (err) {
    console.error(`FAILED ${name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await test('DATABASE_URL (6543 pgbouncer)', process.env.DATABASE_URL);
  await test('DIRECT_URL (5432)', process.env.DIRECT_URL);
}

run();
