/**
 * Script untuk test query performance dengan indexes
 * Menjalankan query yang umum digunakan dan menampilkan waktu eksekusi
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueryPerformance() {
  console.log('🚀 Testing Query Performance with Indexes\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Count total cassettes
    console.log('\n📊 Test 1: Count Total Cassettes');
    const start1 = Date.now();
    const totalCount = await prisma.cassette.count();
    const time1 = Date.now() - start1;
    console.log(`   Total cassettes: ${totalCount.toLocaleString()}`);
    console.log(`   ⏱️  Time: ${time1}ms`);
    console.log(`   ${time1 < 1000 ? '✅' : '⚠️'} ${time1 < 1000 ? 'Fast' : 'Slow'}`);

    // Test 2: Query with pagination (50 records)
    console.log('\n📊 Test 2: Paginated Query (50 records)');
    const start2 = Date.now();
    const paginated = await prisma.cassette.findMany({
      take: 50,
      skip: 0,
      include: {
        cassetteType: true,
        customerBank: {
          select: { bankCode: true, bankName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const time2 = Date.now() - start2;
    console.log(`   Records returned: ${paginated.length}`);
    console.log(`   ⏱️  Time: ${time2}ms`);
    console.log(`   ${time2 < 500 ? '✅' : '⚠️'} ${time2 < 500 ? 'Fast' : 'Slow'}`);

    // Test 3: Filter by status (should use index)
    console.log('\n📊 Test 3: Filter by Status (indexed)');
    const start3 = Date.now();
    const okCassettes = await prisma.cassette.count({
      where: { status: 'OK' },
    });
    const time3 = Date.now() - start3;
    console.log(`   OK cassettes: ${okCassettes.toLocaleString()}`);
    console.log(`   ⏱️  Time: ${time3}ms`);
    console.log(`   ${time3 < 500 ? '✅' : '⚠️'} ${time3 < 500 ? 'Fast' : 'Slow'}`);

    // Test 4: Filter by bank + status (composite index)
    console.log('\n📊 Test 4: Filter by Bank + Status (composite index)');
    const start4 = Date.now();
    const firstBank = await prisma.customerBank.findFirst({
      select: { id: true, bankName: true },
    });
    if (firstBank) {
      const bankCassettes = await prisma.cassette.count({
        where: {
          customerBankId: firstBank.id,
          status: 'OK',
        },
      });
      const time4 = Date.now() - start4;
      console.log(`   Bank: ${firstBank.bankName}`);
      console.log(`   OK cassettes: ${bankCassettes.toLocaleString()}`);
      console.log(`   ⏱️  Time: ${time4}ms`);
      console.log(`   ${time4 < 500 ? '✅' : '⚠️'} ${time4 < 500 ? 'Fast' : 'Slow'}`);
    }

    // Test 5: Search by serial number (unique index)
    console.log('\n📊 Test 5: Search by Serial Number (unique index)');
    const start5 = Date.now();
    const sampleCassette = await prisma.cassette.findFirst({
      select: { serialNumber: true },
    });
    if (sampleCassette) {
      const found = await prisma.cassette.findUnique({
        where: { serialNumber: sampleCassette.serialNumber },
        include: {
          cassetteType: true,
          customerBank: true,
        },
      });
      const time5 = Date.now() - start5;
      console.log(`   Serial number: ${sampleCassette.serialNumber}`);
      console.log(`   Found: ${found ? 'Yes' : 'No'}`);
      console.log(`   ⏱️  Time: ${time5}ms`);
      console.log(`   ${time5 < 100 ? '✅' : '⚠️'} ${time5 < 100 ? 'Fast' : 'Slow'}`);
    }

    // Test 6: Query with _count (relations)
    console.log('\n📊 Test 6: Query with Relations Count');
    const start6 = Date.now();
    const withCounts = await prisma.cassette.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            problemTickets: true,
            repairTickets: true,
            ticketCassetteDetails: true,
          },
        },
      },
    });
    const time6 = Date.now() - start6;
    console.log(`   Records returned: ${withCounts.length}`);
    console.log(`   ⏱️  Time: ${time6}ms`);
    console.log(`   ${time6 < 1000 ? '✅' : '⚠️'} ${time6 < 1000 ? 'Fast' : 'Slow'}`);

    // Test 7: Check active tickets (indexed query)
    console.log('\n📊 Test 7: Check Active Tickets by Cassette');
    const start7 = Date.now();
    const activeTickets = await prisma.problemTicket.count({
      where: {
        cassetteId: { not: null },
        status: { notIn: ['CLOSED'] },
      },
    });
    const time7 = Date.now() - start7;
    console.log(`   Active tickets: ${activeTickets.toLocaleString()}`);
    console.log(`   ⏱️  Time: ${time7}ms`);
    console.log(`   ${time7 < 500 ? '✅' : '⚠️'} ${time7 < 500 ? 'Fast' : 'Slow'}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Performance Summary');
    console.log('='.repeat(60));
    console.log(`Total cassettes in database: ${totalCount.toLocaleString()}`);
    console.log(`\n✅ All queries completed successfully!`);
    console.log(`\n💡 Tips:`);
    console.log(`   - If queries are slow (> 1000ms), check if indexes are created`);
    console.log(`   - Run: SELECT * FROM pg_indexes WHERE tablename = 'cassettes';`);
    console.log(`   - Verify indexes with: EXPLAIN ANALYZE <query>;`);

  } catch (error) {
    console.error('❌ Error testing queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testQueryPerformance()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

