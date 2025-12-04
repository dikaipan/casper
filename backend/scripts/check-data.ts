import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database data...\n');
    
    const machines = await prisma.machine.count();
    const cassettes = await prisma.cassette.count();
    const banks = await prisma.customerBank.count();
    const pengelola = await prisma.pengelola.count();
    const cassetteTypes = await prisma.cassetteType.count();
    
    console.log('📊 Data Count:');
    console.log(`   Machines: ${machines}`);
    console.log(`   Cassettes: ${cassettes}`);
    console.log(`   Banks: ${banks}`);
    console.log(`   Pengelola: ${pengelola}`);
    console.log(`   Cassette Types: ${cassetteTypes}\n`);
    
    if (machines > 0) {
      const sampleMachines = await prisma.machine.findMany({ take: 3 });
      console.log('📋 Sample Machines:');
      sampleMachines.forEach(m => {
        console.log(`   - ${m.machineCode}: ${m.serialNumberManufacturer}`);
      });
      console.log('');
    }
    
    if (cassettes > 0) {
      const sampleCassettes = await prisma.cassette.findMany({ take: 3 });
      console.log('📋 Sample Cassettes:');
      sampleCassettes.forEach(c => {
        console.log(`   - ${c.serialNumber}`);
      });
      console.log('');
    }
    
    if (machines === 0 && cassettes === 0) {
      console.log('⚠️  WARNING: No machines or cassettes found!');
      console.log('   This might be a new MySQL database after migration.');
      console.log('   You need to import your data from PostgreSQL backup or from files.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

