import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('CheckRepairTicketScript');

async function main() {
  const cassetteSN = '76UWAB2SW753996';
  const ticketNumber = 'SO-0412255';

  logger.log(`🔍 Checking repair tickets for cassette ${cassetteSN} and ticket ${ticketNumber}...`);

  // Find cassette
  const cassette = await prisma.cassette.findFirst({
    where: {
      serialNumber: cassetteSN,
    },
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
      repairTickets: {
        where: {
          deletedAt: null,
        },
        include: {
          repairer: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!cassette) {
    logger.log(`❌ Cassette ${cassetteSN} not found`);
    return;
  }

  logger.log(`\n📦 Cassette: ${cassette.serialNumber}`);
  logger.log(`   Type: ${cassette.cassetteTypeId}`);
  logger.log(`   Bank: ${cassette.customerBankId}`);

  logger.log(`\n📋 Deliveries (${cassette.deliveries.length}):`);
  cassette.deliveries.forEach((delivery, idx) => {
    const ticket = delivery.ticket;
    logger.log(`   ${idx + 1}. Ticket: ${ticket?.ticketNumber || 'N/A'} (ID: ${ticket?.id || 'N/A'})`);
    logger.log(`      Deleted: ${ticket?.deletedAt ? 'YES' : 'NO'}`);
    if (ticket?.deletedAt) {
      logger.log(`      Deleted At: ${ticket.deletedAt}`);
    }
  });

  logger.log(`\n📋 Ticket Cassette Details (${cassette.ticketCassetteDetails.length}):`);
  cassette.ticketCassetteDetails.forEach((detail, idx) => {
    const ticket = detail.ticket;
    logger.log(`   ${idx + 1}. Ticket: ${ticket?.ticketNumber || 'N/A'} (ID: ${ticket?.id || 'N/A'})`);
    logger.log(`      Deleted: ${ticket?.deletedAt ? 'YES' : 'NO'}`);
    if (ticket?.deletedAt) {
      logger.log(`      Deleted At: ${ticket.deletedAt}`);
    }
  });

  logger.log(`\n🔧 Repair Tickets (${cassette.repairTickets.length}):`);
  cassette.repairTickets.forEach((repair, idx) => {
    logger.log(`   ${idx + 1}. Repair Ticket ID: ${repair.id}`);
    logger.log(`      Status: ${repair.status}`);
    logger.log(`      Issue: ${repair.reportedIssue || 'N/A'}`);
    logger.log(`      Repaired By: ${repair.repairer?.fullName || 'N/A'}`);
    logger.log(`      Created At: ${repair.createdAt}`);
    logger.log(`      Deleted At: ${repair.deletedAt || 'NO'}`);
  });

  // Check if repair tickets should be shown based on query logic
  logger.log(`\n🔍 Query Logic Check:`);
  cassette.repairTickets.forEach((repair) => {
    logger.log(`\n   Repair Ticket: ${repair.id}`);
    
    // Check condition 1: Not associated with any ticket
    const hasNoDeliveries = cassette.deliveries.length === 0;
    const hasNoTicketDetails = cassette.ticketCassetteDetails.length === 0;
    const condition1 = hasNoDeliveries && hasNoTicketDetails;
    logger.log(`      Condition 1 (standalone): ${condition1 ? '✅' : '❌'}`);
    
    // Check condition 2: Has at least one non-deleted ticket via delivery
    const hasNonDeletedDelivery = cassette.deliveries.some(
      (delivery) => delivery.ticket && delivery.ticket.deletedAt === null
    );
    const condition2 = hasNonDeletedDelivery;
    logger.log(`      Condition 2 (non-deleted delivery): ${condition2 ? '✅' : '❌'}`);
    
    // Check condition 3: Has at least one non-deleted ticket via ticket detail
    const hasNonDeletedTicketDetail = cassette.ticketCassetteDetails.some(
      (detail) => detail.ticket && detail.ticket.deletedAt === null
    );
    const condition3 = hasNonDeletedTicketDetail;
    logger.log(`      Condition 3 (non-deleted ticket detail): ${condition3 ? '✅' : '❌'}`);
    
    // Overall: Should be shown if any condition is true
    const shouldShow = condition1 || condition2 || condition3;
    logger.log(`      Should Show: ${shouldShow ? '✅ YES' : '❌ NO'}`);
    
    if (!shouldShow) {
      logger.log(`      ⚠️  This repair ticket should NOT be shown!`);
    }
  });

  logger.log(`\n✅ Script completed`);
}

main()
  .catch((e) => {
    logger.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

