import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('DebugTicketRepairScript');

async function main() {
  const ticketId = process.argv[2];
  
  if (!ticketId) {
    logger.error('Please provide ticket ID as argument');
    logger.log('Usage: npm run debug:ticket-repair <ticket-id>');
    process.exit(1);
  }

  logger.log(`🔍 Debugging ticket ${ticketId}...`);

  const ticket = await prisma.problemTicket.findUnique({
    where: { id: ticketId },
    include: {
      cassette: true,
      cassetteDelivery: {
        include: {
          cassette: true,
        },
      },
      cassetteDetails: {
        include: {
          cassette: true,
        },
      },
    },
  });

  if (!ticket) {
    logger.error(`❌ Ticket ${ticketId} not found`);
    return;
  }

  logger.log(`\n📋 Ticket Information:`);
  logger.log(`   ID: ${ticket.id}`);
  logger.log(`   Ticket Number: ${ticket.ticketNumber}`);
  logger.log(`   Status: ${ticket.status}`);
  logger.log(`   Deleted: ${ticket.deletedAt ? 'YES' : 'NO'}`);

  logger.log(`\n📦 Cassette Information:`);
  
  // From cassetteDetails
  if (ticket.cassetteDetails && ticket.cassetteDetails.length > 0) {
    logger.log(`   From cassetteDetails (${ticket.cassetteDetails.length}):`);
    ticket.cassetteDetails.forEach((detail, idx) => {
      const cassette = detail.cassette;
      if (cassette) {
        logger.log(`     ${idx + 1}. ${cassette.serialNumber} - Status: ${cassette.status}`);
      }
    });
  }
  
  // From cassetteDelivery
  if (ticket.cassetteDelivery) {
    logger.log(`   From cassetteDelivery:`);
    const deliveryCassette = ticket.cassetteDelivery.cassette;
    if (deliveryCassette) {
      logger.log(`     1. ${deliveryCassette.serialNumber} - Status: ${deliveryCassette.status}`);
    }
  }
  
  // From cassette (legacy)
  if (ticket.cassette) {
    logger.log(`   From cassette (legacy):`);
    logger.log(`     1. ${ticket.cassette.serialNumber} - Status: ${ticket.cassette.status}`);
  }

  logger.log(`\n🔧 Repair Tickets:`);
  const allCassetteIds: string[] = [];
  
  if (ticket.cassetteDetails && ticket.cassetteDetails.length > 0) {
    ticket.cassetteDetails.forEach((detail) => {
      if (detail.cassette?.id) {
        allCassetteIds.push(detail.cassette.id);
      }
    });
  }
  
  if (ticket.cassetteDelivery?.cassetteId) {
    if (!allCassetteIds.includes(ticket.cassetteDelivery.cassetteId)) {
      allCassetteIds.push(ticket.cassetteDelivery.cassetteId);
    }
  }
  
  if (ticket.cassette?.id) {
    if (!allCassetteIds.includes(ticket.cassette.id)) {
      allCassetteIds.push(ticket.cassette.id);
    }
  }

  if (allCassetteIds.length > 0) {
    const repairTickets = await prisma.repairTicket.findMany({
      where: {
        cassetteId: { in: allCassetteIds },
        deletedAt: null,
      },
      include: {
        cassette: {
          select: {
            serialNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (repairTickets.length > 0) {
      logger.log(`   Found ${repairTickets.length} repair tickets:`);
      repairTickets.forEach((repair, idx) => {
        logger.log(`     ${idx + 1}. ${repair.cassette.serialNumber} - Status: ${repair.status} - Created: ${repair.createdAt}`);
      });
    } else {
      logger.log(`   No repair tickets found`);
    }
  }

  logger.log(`\n✅ Validation Check:`);
  logger.log(`   Ticket Status: ${ticket.status} ${ticket.status === 'RECEIVED' ? '✅' : '❌ (Should be RECEIVED)'}`);
  
  if (allCassetteIds.length > 0) {
    const cassettes = await prisma.cassette.findMany({
      where: { id: { in: allCassetteIds } },
      select: {
        id: true,
        serialNumber: true,
        status: true,
      },
    });
    
    logger.log(`   Cassette Statuses:`);
    cassettes.forEach((cassette) => {
      const isValid = ['IN_TRANSIT_TO_RC', 'BAD', 'RECEIVED'].includes(cassette.status);
      logger.log(`     ${cassette.serialNumber}: ${cassette.status} ${isValid ? '✅' : '❌ (Should be IN_TRANSIT_TO_RC, BAD, or RECEIVED)'}`);
    });
  }

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

