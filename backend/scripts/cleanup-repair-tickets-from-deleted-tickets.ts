import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('CleanupRepairTicketsScript');

async function main() {
  logger.log('🔍 Checking repair tickets associated with deleted tickets...');

  // Find all repair tickets that are not deleted themselves
  const allRepairTickets = await prisma.repairTicket.findMany({
    where: {
      deletedAt: null, // Only check non-deleted repair tickets
    },
    include: {
      cassette: {
        include: {
          deliveries: {
            include: {
              ticket: {
                select: {
                  id: true,
                  ticketNumber: true,
                  deletedAt: true,
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
                },
              },
            },
          },
        },
      },
    },
  });

  logger.log(`Found ${allRepairTickets.length} non-deleted repair tickets to check`);

  let deletedCount = 0;
  const repairTicketsToDelete: string[] = [];

  for (const repairTicket of allRepairTickets) {
    const cassette = repairTicket.cassette;
    let shouldDelete = false;
    let reason = '';

    // Check if repair ticket is associated with a deleted ticket via delivery
    if (cassette.deliveries && cassette.deliveries.length > 0) {
      const hasDeletedTicketDelivery = cassette.deliveries.some(
        (delivery) => delivery.ticket && delivery.ticket.deletedAt !== null
      );
      
      if (hasDeletedTicketDelivery) {
        // Check if there's also a non-deleted ticket delivery
        const hasNonDeletedTicketDelivery = cassette.deliveries.some(
          (delivery) => delivery.ticket && delivery.ticket.deletedAt === null
        );
        
        // Only delete if ALL associated tickets are deleted
        if (!hasNonDeletedTicketDelivery) {
          shouldDelete = true;
          reason = 'All associated tickets via delivery are deleted';
        }
      }
    }

    // Check if repair ticket is associated with a deleted ticket via ticket detail
    if (cassette.ticketCassetteDetails && cassette.ticketCassetteDetails.length > 0) {
      const hasDeletedTicketDetail = cassette.ticketCassetteDetails.some(
        (detail) => detail.ticket && detail.ticket.deletedAt !== null
      );
      
      if (hasDeletedTicketDetail) {
        // Check if there's also a non-deleted ticket detail
        const hasNonDeletedTicketDetail = cassette.ticketCassetteDetails.some(
          (detail) => detail.ticket && detail.ticket.deletedAt === null
        );
        
        // Only delete if ALL associated tickets are deleted
        if (!hasNonDeletedTicketDetail && !shouldDelete) {
          shouldDelete = true;
          reason = 'All associated tickets via ticket detail are deleted';
        }
      }
    }

    // If repair ticket is associated with both delivery and ticket detail, 
    // check if ALL associated tickets are deleted
    if (!shouldDelete) {
      // Check if repair ticket is associated ONLY with deleted tickets
      const hasAnyDelivery = cassette.deliveries && cassette.deliveries.length > 0;
      const hasAnyTicketDetail = cassette.ticketCassetteDetails && cassette.ticketCassetteDetails.length > 0;
      
      if (hasAnyDelivery || hasAnyTicketDetail) {
        // Check if ALL deliveries are from deleted tickets
        const allDeliveriesDeleted = hasAnyDelivery && 
          cassette.deliveries.every((delivery) => delivery.ticket && delivery.ticket.deletedAt !== null);
        
        // Check if ALL ticket details are from deleted tickets
        const allTicketDetailsDeleted = hasAnyTicketDetail && 
          cassette.ticketCassetteDetails.every((detail) => detail.ticket && detail.ticket.deletedAt !== null);
        
        // If repair ticket has associations and ALL are deleted, delete it
        if ((hasAnyDelivery && allDeliveriesDeleted && !hasAnyTicketDetail) ||
            (hasAnyTicketDetail && allTicketDetailsDeleted && !hasAnyDelivery) ||
            (hasAnyDelivery && hasAnyTicketDetail && allDeliveriesDeleted && allTicketDetailsDeleted)) {
          shouldDelete = true;
          reason = 'All associated tickets are deleted';
        }
      }
    }

    if (shouldDelete) {
      repairTicketsToDelete.push(repairTicket.id);
      logger.log(`❌ Will delete repair ticket ${repairTicket.id} - ${reason}`);
    }
  }

  if (repairTicketsToDelete.length === 0) {
    logger.log('✅ No repair tickets to clean up. All repair tickets are properly associated with non-deleted tickets.');
    return;
  }

  logger.log(`\n📊 Summary:`);
  logger.log(`   Total repair tickets checked: ${allRepairTickets.length}`);
  logger.log(`   Repair tickets to delete: ${repairTicketsToDelete.length}`);

  // Soft delete repair tickets
  const result = await prisma.repairTicket.updateMany({
    where: {
      id: { in: repairTicketsToDelete },
    },
    data: {
      deletedAt: new Date(),
      deletedBy: null, // System cleanup
    },
  });

  logger.log(`\n✅ Successfully soft-deleted ${result.count} repair tickets`);
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

