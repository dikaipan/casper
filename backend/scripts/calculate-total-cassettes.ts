import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateTotal() {
  try {
    console.log('📊 Calculating Total Cassettes...\n');

    // Get total cassettes
    const totalCassettes = await prisma.cassette.count();

    // Get all machines with cassette counts
    const machines = await prisma.machine.findMany({
      include: {
        cassettes: {
          select: {
            id: true,
          },
        },
      },
    });

    // Group by cassette count
    const with10 = machines.filter(m => m.cassettes.length === 10).length;
    const with8 = machines.filter(m => m.cassettes.length === 8).length;
    const with12 = machines.filter(m => m.cassettes.length === 12).length;
    const withOther = machines.filter(m => {
      const count = m.cassettes.length;
      return count !== 10 && count !== 8 && count !== 12;
    });

    // Calculate expected total
    const expectedTotal = 1600 * 10; // 16,000
    const calculatedTotal = with10 * 10 + with8 * 8 + with12 * 12;
    const difference = expectedTotal - totalCassettes;

    console.log('📊 Results:');
    console.log(`   - Total Cassettes in Database: ${totalCassettes.toLocaleString()}`);
    console.log(`   - Total Machines: ${machines.length.toLocaleString()}`);
    console.log(`\n📊 Distribution:`);
    console.log(`   - Machines with 10 cassettes: ${with10.toLocaleString()} (${(with10 * 10).toLocaleString()} cassettes)`);
    console.log(`   - Machines with 8 cassettes: ${with8.toLocaleString()} (${(with8 * 8).toLocaleString()} cassettes)`);
    console.log(`   - Machines with 12 cassettes: ${with12.toLocaleString()} (${(with12 * 12).toLocaleString()} cassettes)`);
    
    if (withOther.length > 0) {
      console.log(`   - Machines with other counts: ${withOther.length.toLocaleString()}`);
      withOther.forEach(m => {
        console.log(`     • ${m.serialNumberManufacturer}: ${m.cassettes.length} cassettes`);
      });
    }

    console.log(`\n📊 Calculation:`);
    console.log(`   - Calculated Total: ${calculatedTotal.toLocaleString()}`);
    console.log(`   - Expected Total (1600 × 10): ${expectedTotal.toLocaleString()}`);
    console.log(`   - Difference: ${difference.toLocaleString()}`);

    if (totalCassettes === expectedTotal) {
      console.log(`\n✅ Total cassettes is exactly 16,000!`);
    } else if (totalCassettes < expectedTotal) {
      console.log(`\n⚠️  Total cassettes is ${difference.toLocaleString()} less than expected (16,000)`);
      console.log(`   Reason: ${with8} machines have only 8 cassettes instead of 10`);
      console.log(`   Missing: ${with8 * 2} cassettes (${with8} machines × 2 cassettes)`);
    } else {
      console.log(`\n⚠️  Total cassettes is ${(totalCassettes - expectedTotal).toLocaleString()} more than expected (16,000)`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await calculateTotal();
  } catch (error: any) {
    console.error('\n❌ Calculation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

