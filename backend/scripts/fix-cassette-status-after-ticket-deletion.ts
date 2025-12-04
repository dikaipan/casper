import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('FixCassetteStatusScript');

async function main() {
  logger.log('🔍 Checking cassettes with IN_REPAIR status that should be OK...');

  // Find all cassettes with IN_REPAIR status
  const cassettes = await prisma.cassette.findMany({
    where: {
      status: 'IN_REPAIR',
    },
    include: {
      deliveries: {
        include: {
          ticket: {
            select: {
              id: true,
              ticketNumber: true,
              deletedAt: true,
              status: true,
            },
          },
        },
      },
      ticketCassetteDetails: {
        include: {
          ticket: {
            select: {
              id: true,
              ticketNumber: true,
              deletedAt: true,
              status: true,
            },
          },
        },
      },
      repairTickets: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  logger.log(`Found ${cassettes.length} cassettes with IN_REPAIR status`);

  const cassettesToFix: string[] = [];

  for (const cassette of cassettes) {
    let shouldFix = false;
    let reason = '';

    // Check if cassette has active (non-deleted) tickets
    const hasActiveDelivery = cassette.deliveries.some(
      (delivery) => delivery.ticket && delivery.ticket.deletedAt === null
    );
    const hasActiveTicketDetail = cassette.ticketCassetteDetails.some(
      (detail) => detail.ticket && detail.ticket.deletedAt === null
    );

    // Check if cassette has active repair tickets
    const hasActiveRepairTicket = cassette.repairTickets.length > 0;

    // If no active tickets and no active repair tickets, should be OK
    if (!hasActiveDelivery && !hasActiveTicketDetail && !hasActiveRepairTicket) {
      shouldFix = true;
      reason = 'No active tickets or repair tickets';
    } else if (!hasActiveDelivery && !hasActiveTicketDetail && hasActiveRepairTicket) {
      // Has repair ticket but no active tickets - check if repair is completed
      const latestRepair = cassette.repairTickets[0];
      if (latestRepair.status === 'COMPLETED' || latestRepair.status === 'SCRAPPED') {
        shouldFix = true;
        reason = 'Repair completed but no active tickets';
      }
    }

    if (shouldFix) {
      cassettesToFix.push(cassette.id);
      logger.log(`❌ Will fix cassette ${cassette.serialNumber} - ${reason}`);
    }
  }

  if (cassettesToFix.length === 0) {
    logger.log('✅ No cassettes need fixing. All cassettes with IN_REPAIR status have active tickets or repairs.');
    return;
  }

  logger.log(`\n📊 Summary:`);
  logger.log(`   Total cassettes checked: ${cassettes.length}`);
  logger.log(`   Cassettes to fix: ${cassettesToFix.length}`);

  // Update cassette status to OK
  const result = await prisma.cassette.updateMany({
    where: {
      id: { in: cassettesToFix },
    },
    data: {
      status: 'OK',
      updatedAt: new Date(),
    },
  });

  logger.log(`\n✅ Successfully updated ${result.count} cassettes to OK status`);
  logger.log('✅ Script completed successfully');
}

main()
  .catch((e) => {
    logger.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

