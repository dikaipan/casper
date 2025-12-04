import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLinks() {
  console.log('🔍 Checking machine-cassette links...\n');
  
  // Get total machines
  const totalMachines = await prisma.machine.count();
  console.log(`📊 Total machines: ${totalMachines}`);
  
  // Get total cassettes
  const totalCassettes = await prisma.cassette.count();
  console.log(`📦 Total cassettes: ${totalCassettes}`);
  
  // Get cassettes WITH machineId
  const cassettesWithMachine = await prisma.cassette.count({
    where: {
      machineId: { not: null }
    }
  });
  console.log(`✅ Cassettes with machineId: ${cassettesWithMachine}`);
  
  // Get cassettes WITHOUT machineId
  const cassettesWithoutMachine = await prisma.cassette.count({
    where: {
      machineId: null
    }
  });
  console.log(`⚠️  Cassettes without machineId: ${cassettesWithoutMachine}`);
  
  // Sample a machine and check its cassettes
  const sampleMachine = await prisma.machine.findFirst({
    include: {
      cassettes: true,
    },
  });
  
  if (sampleMachine) {
    console.log(`\n🖥️  Sample Machine: ${sampleMachine.serialNumberManufacturer}`);
    console.log(`   Machine ID: ${sampleMachine.id}`);
    console.log(`   Cassettes count: ${sampleMachine.cassettes.length}`);
    
    if (sampleMachine.cassettes.length > 0) {
      console.log(`   Sample cassette SNs:`);
      sampleMachine.cassettes.slice(0, 3).forEach((c, i) => {
        console.log(`     ${i + 1}. ${c.serialNumber} (${c.usageType})`);
      });
    } else {
      console.log(`   ❌ No cassettes linked to this machine!`);
    }
  }
  
  await prisma.$disconnect();
}

checkLinks().catch(console.error);

