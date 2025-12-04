import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCassetteCounts() {
  console.log('🔍 Checking cassette counts per machine...\n');

  // Get all machines with their cassettes
  const machines = await prisma.machine.findMany({
    include: {
      cassettes: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`📊 Total machines: ${machines.length}`);

  // Group by cassette count
  const countGroups = new Map<number, typeof machines>();
  machines.forEach(machine => {
    const count = machine.cassettes.length;
    if (!countGroups.has(count)) {
      countGroups.set(count, []);
    }
    countGroups.get(count)!.push(machine);
  });

  // Display statistics
  console.log('\n📈 Cassette Count Distribution:');
  const sortedCounts = Array.from(countGroups.keys()).sort((a, b) => b - a);
  
  for (const count of sortedCounts) {
    const machinesWithCount = countGroups.get(count)!;
    console.log(`  ${count} cassettes: ${machinesWithCount.length} machines`);
  }

  // Show machines with less than 10 cassettes
  const machinesWithLess = machines.filter(m => m.cassettes.length < 10);
  if (machinesWithLess.length > 0) {
    console.log('\n⚠️ Machines with LESS than 10 cassettes:');
    machinesWithLess.forEach(machine => {
      console.log(`  • ${machine.serialNumberManufacturer} (${machine.machineCode}): ${machine.cassettes.length} cassettes`);
    });
  }

  // Show machines with more than 10 cassettes
  const machinesWithMore = machines.filter(m => m.cassettes.length > 10);
  if (machinesWithMore.length > 0) {
    console.log('\n⚠️ Machines with MORE than 10 cassettes:');
    machinesWithMore.forEach(machine => {
      console.log(`  • ${machine.serialNumberManufacturer} (${machine.machineCode}): ${machine.cassettes.length} cassettes`);
    });
  }

  // Show machines with exactly 10 cassettes
  const machinesWithExactly10 = machines.filter(m => m.cassettes.length === 10);
  console.log(`\n✅ Machines with EXACTLY 10 cassettes: ${machinesWithExactly10.length}`);

  // Total cassettes
  const totalCassettes = machines.reduce((sum, m) => sum + m.cassettes.length, 0);
  console.log(`\n📦 Total cassettes: ${totalCassettes}`);
  console.log(`📦 Expected: ${machines.length * 10}`);
  console.log(`📦 Difference: ${totalCassettes - (machines.length * 10)}`);

  await prisma.$disconnect();
}

checkCassetteCounts().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

