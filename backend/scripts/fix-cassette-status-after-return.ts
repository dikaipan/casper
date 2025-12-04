import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to fix cassette status for cassettes that have been returned
 * but still have IN_REPAIR status
 * 
 * This script:
 * 1. Finds all cassettes with IN_REPAIR status
 * 2. Checks if they have a return record that has been received
 * 3. Updates their status to OK if return is received
 */
async function fixCassetteStatusAfterReturn() {
  try {
    console.log('🔍 Checking cassettes with IN_REPAIR status that have been returned...\n');

    // Find all cassettes with IN_REPAIR status
    const cassettesInRepair = await prisma.cassette.findMany({
      where: {
        status: 'IN_REPAIR',
      },
      select: {
        id: true,
        serialNumber: true,
        status: true,
      },
    });

    console.log(`Found ${cassettesInRepair.length} cassettes with IN_REPAIR status\n`);

    let fixedCount = 0;
    let checkedCount = 0;

    for (const cassette of cassettesInRepair) {
      checkedCount++;
      
      // Check if cassette has a return record that has been received
      const returnRecord = await (prisma as any).cassetteReturn.findFirst({
        where: {
          cassetteId: cassette.id,
          receivedAtPengelola: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      });

      // Also check if ticket has return (for multi-cassette tickets)
      const ticketsWithCassette = await prisma.problemTicket.findMany({
        where: {
          OR: [
            { cassetteId: cassette.id },
            {
              cassetteDetails: {
                some: { cassetteId: cassette.id },
              },
            },
          ],
          deletedAt: null,
        },
        select: {
          id: true,
          ticketNumber: true,
        },
      });

      let ticketReturnReceived = false;
      if (ticketsWithCassette.length > 0) {
        const ticketIds = ticketsWithCassette.map(t => t.id);
        const ticketReturn = await (prisma as any).cassetteReturn.findFirst({
          where: {
            ticketId: { in: ticketIds },
            receivedAtPengelola: {
              not: null,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        });
        ticketReturnReceived = ticketReturn !== null;
      }

      if (returnRecord || ticketReturnReceived) {
        // Return has been received, update status to OK
        await prisma.cassette.update({
          where: { id: cassette.id },
          data: { status: 'OK' },
        });

        fixedCount++;
        console.log(`✅ Fixed: ${cassette.serialNumber} - Updated from IN_REPAIR to OK`);
        
        if (returnRecord) {
          console.log(`   Return received at: ${returnRecord.receivedAtPengelola}`);
        }
        if (ticketReturnReceived) {
          console.log(`   Ticket return received`);
        }
      } else {
        // Check if cassette is in IN_TRANSIT_TO_PENGELOLA (should be OK if return is received)
        const cassetteFull = await prisma.cassette.findUnique({
          where: { id: cassette.id },
          select: { status: true },
        });

        if (cassetteFull?.status === 'IN_TRANSIT_TO_PENGELOLA') {
          // Check if return is received
          const transitReturn = await (prisma as any).cassetteReturn.findFirst({
            where: {
              cassetteId: cassette.id,
              receivedAtPengelola: {
                not: null,
              },
            },
          });

          if (transitReturn) {
            await prisma.cassette.update({
              where: { id: cassette.id },
              data: { status: 'OK' },
            });

            fixedCount++;
            console.log(`✅ Fixed: ${cassette.serialNumber} - Updated from IN_TRANSIT_TO_PENGELOLA to OK`);
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Checked: ${checkedCount} cassettes`);
    console.log(`   Fixed: ${fixedCount} cassettes`);
    console.log(`   No action needed: ${checkedCount - fixedCount} cassettes`);

  } catch (error) {
    console.error('❌ Error fixing cassette status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCassetteStatusAfterReturn()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

