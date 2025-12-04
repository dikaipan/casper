import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('CheckTicketStatusScript');

async function main() {
  const ticketNumber = 'SO-0412258';

  logger.log(`🔍 Checking ticket ${ticketNumber}...`);

  const ticket = await prisma.problemTicket.findFirst({
    where: {
      ticketNumber: ticketNumber,
    },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      deletedAt: true,
      deletedBy: true,
      createdAt: true,
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
    logger.log(`   Deleted At: ${ticket.deletedAt}`);
    logger.log(`   Deleted By: ${ticket.deletedBy || 'N/A'}`);
  }
  logger.log(`   Created At: ${ticket.createdAt}`);

  if (ticket.deletedAt) {
    logger.log(`\n⚠️  Ticket is DELETED but repair tickets are still showing!`);
    logger.log(`   This means the query filter is not working correctly.`);
  } else {
    logger.log(`\n✅ Ticket is NOT deleted, so repair tickets should be showing.`);
    logger.log(`   If you want to hide repair tickets, you need to delete the ticket first.`);
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

