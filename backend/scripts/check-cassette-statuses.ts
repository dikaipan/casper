import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCassetteStatuses() {
  console.log('🔍 Checking actual cassette statuses in database...\n');
  
  // Get count by status
  const statuses = await prisma.cassette.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
    orderBy: {
      _count: {
        status: 'desc',
      },
    },
  });
  
  console.log('📊 Status Distribution:');
  console.log('═══════════════════════════════════════════');
  statuses.forEach((s) => {
    console.log(`  ${s.status.padEnd(25)} → ${s._count.status} cassettes`);
  });
  
  console.log('\n📋 Expected Status Colors (from schema):');
  console.log('═══════════════════════════════════════════');
  console.log('  OK                       → Green (Emerald)');
  console.log('  BAD                      → Red');
  console.log('  IN_TRANSIT_TO_RC         → Amber/Yellow');
  console.log('  IN_REPAIR                → Orange');
  console.log('  IN_TRANSIT_TO_PENGELOLA  → Sky Blue');
  console.log('  SCRAPPED                 → Gray');
  
  // Get sample of each status
  console.log('\n🔬 Sample cassettes per status:');
  console.log('═══════════════════════════════════════════');
  for (const statusGroup of statuses) {
    const samples = await prisma.cassette.findMany({
      where: { status: statusGroup.status },
      take: 2,
      select: {
        serialNumber: true,
        status: true,
        usageType: true,
      },
    });
    
    console.log(`\n  ${statusGroup.status}:`);
    samples.forEach((c) => {
      console.log(`    - ${c.serialNumber} (${c.usageType || 'N/A'})`);
    });
  }
  
  await prisma.$disconnect();
}

checkCassetteStatuses().catch((e) => {
  console.error(e);
  process.exit(1);
});

