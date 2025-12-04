import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeedData() {
  console.log('🔍 Checking seed data...\n');
  
  // Check banks
  const banksCount = await prisma.customerBank.count();
  console.log(`📊 Banks: ${banksCount}`);
  if (banksCount > 0) {
    const sampleBanks = await prisma.customerBank.findMany({ take: 3 });
    sampleBanks.forEach(bank => {
      console.log(`   - ${bank.bankCode}: ${bank.bankName}`);
    });
  }
  
  // Check vendors
  const pengelolasCount = await prisma.pengelola.count();
  console.log(`\n📊 Vendors: ${pengelolasCount}`);
  if (pengelolasCount > 0) {
    const samplePengelola = await prisma.pengelola.findMany({ take: 3 });
    samplePengelola.forEach(vendor => {
      console.log(`   - ${vendor.pengelolaCode}: ${vendor.companyName}`);
    });
  }
  
  // Check cassette types
  const cassetteTypesCount = await prisma.cassetteType.count();
  console.log(`\n📊 Cassette Types: ${cassetteTypesCount}`);
  if (cassetteTypesCount > 0) {
    const sampleTypes = await prisma.cassetteType.findMany({ take: 5 });
    sampleTypes.forEach(type => {
      console.log(`   - ${type.typeCode}: Machine Type ${type.machineType}`);
    });
  }
  
  console.log('\n');
  
  if (banksCount === 0 || pengelolasCount === 0 || cassetteTypesCount === 0) {
    console.log('⚠️  WARNING: Some seed data is missing!');
    console.log('   Run: npm run prisma:seed');
  } else {
    console.log('✅ All seed data exists!');
  }
  
  await prisma.$disconnect();
}

checkSeedData().catch(console.error);

