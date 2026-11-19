const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Creating Missing Tables Safely Without Data Loss ---');

  // 1. Create TripConfig table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TripConfig" (
      "id" TEXT NOT NULL DEFAULT 'global',
      "tripTitle" TEXT NOT NULL DEFAULT 'Himalayan Escape 2026',
      "subtitle" TEXT NOT NULL DEFAULT 'Manali × Kasol Student Expedition',
      "totalCapacity" INTEGER NOT NULL DEFAULT 75,
      "packagePrice" INTEGER NOT NULL DEFAULT 6200,
      "groupPackagePrice" INTEGER NOT NULL DEFAULT 6200,
      "groupSizeThreshold" INTEGER NOT NULL DEFAULT 1,
      "depositPrice" INTEGER NOT NULL DEFAULT 1000,
      "departureDate" TEXT NOT NULL DEFAULT '2026-10-24',
      "returnDate" TEXT NOT NULL DEFAULT '2026-10-29',
      "reportingTime" TEXT NOT NULL DEFAULT '07:00 PM',
      "pickupLocation" TEXT NOT NULL DEFAULT 'Near Main Gate (NH-2), Mathura',
      "emergencyHelplines" TEXT[] DEFAULT ARRAY['6398412828', '8126854850']::TEXT[],
      "announcementBanner" TEXT,
      "announcementActive" BOOLEAN NOT NULL DEFAULT false,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TripConfig_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log('✓ TripConfig table verified/created');

  // 2. Insert initial global row
  await prisma.$executeRawUnsafe(`
    INSERT INTO "TripConfig" ("id", "tripTitle", "subtitle", "totalCapacity", "packagePrice", "groupPackagePrice", "groupSizeThreshold", "depositPrice", "departureDate", "returnDate", "reportingTime", "pickupLocation", "emergencyHelplines", "announcementActive", "updatedAt")
    VALUES ('global', 'Himalayan Escape 2026', 'Manali × Kasol Student Expedition', 75, 6200, 6200, 1, 1000, '2026-10-24', '2026-10-29', '07:00 PM', 'Near Main Gate (NH-2), Mathura', ARRAY['6398412828', '8126854850']::TEXT[], false, CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO UPDATE SET "packagePrice" = 6200, "totalCapacity" = 75;
  `);
  console.log('✓ TripConfig global row verified');

  // 3. Create Coupon table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Coupon" (
      "id" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "discountAmount" INTEGER NOT NULL DEFAULT 200,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "maxUses" INTEGER NOT NULL DEFAULT 0,
      "usedCount" INTEGER NOT NULL DEFAULT 0,
      "expiresAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");
  `);
  console.log('✓ Coupon table verified/created');
}

main()
  .then(() => {
    console.log('✅ Missing tables created safely.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error creating missing tables:', e);
    process.exit(1);
  });
