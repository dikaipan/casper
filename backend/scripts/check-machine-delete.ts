import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMachineDelete(machineId: string) {
  try {
    console.log(`🔍 Checking machine: ${machineId}\n`);
    
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        cassettes: {
          select: {
            id: true,
            serialNumber: true,
            status: true,
            machineId: true,
          },
        },
      },
    });

    if (!machine) {
      console.log('❌ Machine not found');
      return;
    }

    console.log(`✅ Machine found: ${machine.machineCode}`);
    console.log(`   Serial: ${machine.serialNumberManufacturer}`);
    console.log(`   Status: ${machine.status}`);
    console.log(`   Cassettes from include: ${machine.cassettes.length}\n`);

    // Check cassettes directly
    const allCassettes = await prisma.cassette.findMany({
      where: { machineId: machineId },
      select: {
        id: true,
        serialNumber: true,
        status: true,
        machineId: true,
      },
    });

    console.log(`📦 Cassettes from direct query: ${allCassettes.length}`);
    allCassettes.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.serialNumber} - Status: ${c.status}`);
    });

    const activeCassettes = allCassettes.filter(
      (c) => c.status !== 'SCRAPPED',
    );

    console.log(`\n⚠️  Active cassettes (not SCRAPPED): ${activeCassettes.length}`);
    if (activeCassettes.length > 0) {
      console.log('   Cannot delete machine because of:');
      activeCassettes.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.serialNumber} (Status: ${c.status})`);
      });
    } else {
      console.log('   ✅ Machine can be deleted (no active cassettes)');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const machineId = process.argv[2];
if (!machineId) {
  console.error('Usage: npx ts-node scripts/check-machine-delete.ts <machine-id>');
  process.exit(1);
}

checkMachineDelete(machineId);

