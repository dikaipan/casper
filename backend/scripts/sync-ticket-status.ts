import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('SyncTicketStatusScript');

async function main() {
  const ticketNumber = process.argv[2] || 'SO-0412258';

  logger.log(`🔍 Syncing ticket ${ticketNumber}...`);

  const ticket = await prisma.problemTicket.findFirst({
    where: {
      ticketNumber: ticketNumber,
      deletedAt: null,
    },
    include: {
      cassetteDetails: {
        include: {
          cassette: {
            select: { id: true },
          },
        },
      },
      cassette: {
        select: { id: true },
      },
    },
  });

  if (!ticket) {
    logger.error(`❌ Ticket ${ticketNumber} not found`);
    return;
  }

  logger.log(`\n📋 Ticket Information:`);
  logger.log(`   ID: ${ticket.id}`);
  logger.log(`   Ticket Number: ${ticket.ticketNumber}`);
  logger.log(`   Current Status: ${ticket.status}`);

  const ticketCreatedAt = ticket.createdAt;
  
  // Get all cassette IDs from this SO
  const cassetteIds: string[] = [];
  if (ticket.cassetteDetails && ticket.cassetteDetails.length > 0) {
    ticket.cassetteDetails.forEach((detail: any) => {
      if (detail.cassette?.id) {
        cassetteIds.push(detail.cassette.id);
      }
    });
  } else if (ticket.cassette?.id) {
    cassetteIds.push(ticket.cassette.id);
  }

  logger.log(`\n📦 Cassette IDs: ${cassetteIds.length}`);
  cassetteIds.forEach((id, idx) => {
    logger.log(`   ${idx + 1}. ${id}`);
  });

  if (cassetteIds.length === 0) {
    logger.error(`❌ No cassettes found for this ticket`);
    return;
  }

  // Find all repair tickets for these cassettes created after SO creation
  const allRepairTicketsRaw = await prisma.repairTicket.findMany({
    where: {
      cassetteId: { in: cassetteIds },
      createdAt: { gte: ticketCreatedAt },
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      cassetteId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  logger.log(`\n🔧 Repair Tickets Found: ${allRepairTicketsRaw.length}`);
  allRepairTicketsRaw.forEach((rt, idx) => {
    logger.log(`   ${idx + 1}. Cassette ${rt.cassetteId} - Status: ${rt.status} - Created: ${rt.createdAt}`);
  });

  // Get latest repair ticket per cassette
  const latestRepairsMap = new Map<string, { id: string; status: string; cassetteId: string; createdAt: Date }>();
  for (const rt of allRepairTicketsRaw) {
    if (!latestRepairsMap.has(rt.cassetteId)) {
      latestRepairsMap.set(rt.cassetteId, rt);
    }
  }
  const latestRepairs = Array.from(latestRepairsMap.values());

  logger.log(`\n📊 Latest Repair Tickets per Cassette: ${latestRepairs.length}`);
  latestRepairs.forEach((rt, idx) => {
    logger.log(`   ${idx + 1}. Cassette ${rt.cassetteId} - Status: ${rt.status}`);
  });

  const expectedRepairCount = cassetteIds.length;
  const actualRepairCount = latestRepairs.length;

  logger.log(`\n✅ Validation:`);
  logger.log(`   Expected Repair Count: ${expectedRepairCount}`);
  logger.log(`   Actual Repair Count: ${actualRepairCount}`);

  if (actualRepairCount >= expectedRepairCount) {
    const completedRepairs = latestRepairs.filter(rt => rt.status === 'COMPLETED');
    const completedCount = completedRepairs.length;
    const allCompleted = completedCount === expectedRepairCount && 
      latestRepairs.every(rt => rt.status === 'COMPLETED');

    logger.log(`   Completed Repairs: ${completedCount}/${expectedRepairCount}`);
    logger.log(`   All Completed: ${allCompleted ? '✅ YES' : '❌ NO'}`);

    if (allCompleted && ticket.status !== 'RESOLVED') {
      await prisma.problemTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'RESOLVED' as any,
          resolvedAt: new Date(),
        },
      });
      logger.log(`\n✅ SUCCESS: Ticket ${ticketNumber} updated to RESOLVED`);
    } else if (ticket.status === 'RESOLVED') {
      logger.log(`\n✅ Ticket ${ticketNumber} is already RESOLVED`);
    } else {
      logger.log(`\n❌ Cannot update: Not all repair tickets are completed`);
    }
  } else {
    logger.log(`\n❌ Cannot update: Missing repair tickets (${actualRepairCount}/${expectedRepairCount})`);
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

