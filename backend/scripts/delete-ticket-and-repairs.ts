import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('DeleteTicketAndRepairsScript');

async function main() {
  const ticketNumber = 'SO-0412257';

  logger.log(`🔍 Checking ticket ${ticketNumber}...`);

  // Find ticket
  const ticket = await prisma.problemTicket.findFirst({
    where: {
      ticketNumber: ticketNumber,
    },
    include: {
      cassetteDelivery: {
        include: {
          cassette: {
            include: {
              repairTickets: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
      cassetteDetails: {
        include: {
          cassette: {
            include: {
              repairTickets: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    logger.log(`❌ Ticket ${ticketNumber} not found`);
    return;
  }

  logger.log(`\n📋 Ticket Information:`);
  logger.log(`   ID: ${ticket.id}`);
  logger.log(`   Ticket Number: ${ticket.ticketNumber}`);
  logger.log(`   Status: ${ticket.status}`);
  logger.log(`   Deleted: ${ticket.deletedAt ? 'YES' : 'NO'}`);

  if (ticket.deletedAt) {
    logger.log(`\n⚠️  Ticket is already deleted!`);
    return;
  }

  // Collect all repair tickets to delete
  const repairTicketIds: string[] = [];

  // From delivery (singular, one-to-one relationship)
  if (ticket.cassetteDelivery?.cassette) {
    ticket.cassetteDelivery.cassette.repairTickets.forEach((repair) => {
      if (!repairTicketIds.includes(repair.id)) {
        repairTicketIds.push(repair.id);
      }
    });
  }

  // From ticket details (multiple cassettes)
  ticket.cassetteDetails.forEach((detail) => {
    detail.cassette.repairTickets.forEach((repair) => {
      if (!repairTicketIds.includes(repair.id)) {
        repairTicketIds.push(repair.id);
      }
    });
  });

  logger.log(`\n📊 Summary:`);
  logger.log(`   Ticket: ${ticket.ticketNumber}`);
  logger.log(`   Repair Tickets to delete: ${repairTicketIds.length}`);

  if (repairTicketIds.length > 0) {
    logger.log(`\n🔧 Repair Tickets to delete:`);
    repairTicketIds.forEach((id, idx) => {
      logger.log(`   ${idx + 1}. ${id}`);
    });
  }

  // Confirm deletion
  logger.log(`\n🗑️  Starting deletion...`);

  // Collect all cassette IDs that need status update
  const cassetteIdsToUpdate: string[] = [];

  // From delivery (singular, one-to-one relationship)
  if (ticket.cassetteDelivery?.cassette) {
    if (!cassetteIdsToUpdate.includes(ticket.cassetteDelivery.cassette.id)) {
      cassetteIdsToUpdate.push(ticket.cassetteDelivery.cassette.id);
    }
  }

  // From ticket details (multiple cassettes)
  ticket.cassetteDetails.forEach((detail) => {
    if (!cassetteIdsToUpdate.includes(detail.cassette.id)) {
      cassetteIdsToUpdate.push(detail.cassette.id);
    }
  });

  logger.log(`\n📦 Cassettes to restore to OK status: ${cassetteIdsToUpdate.length}`);
  if (cassetteIdsToUpdate.length > 0) {
    cassetteIdsToUpdate.forEach((id, idx) => {
      logger.log(`   ${idx + 1}. ${id}`);
    });
  }

  // Perform all operations in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Soft delete repair tickets first
    if (repairTicketIds.length > 0) {
      const repairResult = await tx.repairTicket.updateMany({
        where: {
          id: { in: repairTicketIds },
        },
        data: {
          deletedAt: new Date(),
          deletedBy: null, // System cleanup
        },
      });
      logger.log(`✅ Soft-deleted ${repairResult.count} repair tickets`);
    }

    // 2. Restore cassette status to OK
    if (cassetteIdsToUpdate.length > 0) {
      const cassetteResult = await tx.cassette.updateMany({
        where: {
          id: { in: cassetteIdsToUpdate },
        },
        data: {
          status: 'OK',
          updatedAt: new Date(),
        },
      });
      logger.log(`✅ Restored ${cassetteResult.count} cassettes to OK status`);
    }

    // 3. Soft delete ticket
    await tx.problemTicket.update({
      where: {
        id: ticket.id,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: null, // System cleanup
      },
    });

    logger.log(`✅ Soft-deleted ticket ${ticketNumber}`);
  });

  logger.log(`\n✅ Script completed successfully`);
  logger.log(`   Ticket ${ticketNumber}, ${repairTicketIds.length} repair tickets, and ${cassetteIdsToUpdate.length} cassettes have been processed.`);
}

main()
  .catch((e) => {
    logger.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

