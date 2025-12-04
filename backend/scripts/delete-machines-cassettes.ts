import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllMachinesAndCassettes() {
  console.log('🗑️  Starting deletion of all machines and cassettes...\n');

  try {
    // Step 1: Delete related data that references cassettes and machines
    console.log('📋 Step 1: Deleting related data...');
    
    // Delete PMCassetteDetail (references cassettes)
    const pmCassetteDetailsCount = await prisma.pMCassetteDetail.deleteMany({});
    console.log(`   ✅ Deleted ${pmCassetteDetailsCount.count} PM cassette details`);

    // Delete TicketCassetteDetail (references cassettes)
    const ticketCassetteDetailsCount = await prisma.ticketCassetteDetail.deleteMany({});
    console.log(`   ✅ Deleted ${ticketCassetteDetailsCount.count} ticket cassette details`);

    // Delete PreventiveMaintenance (may reference machines/cassettes)
    const pmCount = await prisma.preventiveMaintenance.deleteMany({});
    console.log(`   ✅ Deleted ${pmCount.count} preventive maintenance records`);

    // Delete RepairTickets (references cassettes)
    const repairTicketsCount = await prisma.repairTicket.deleteMany({});
    console.log(`   ✅ Deleted ${repairTicketsCount.count} repair tickets`);

    // Delete CassetteDeliveries (references cassettes)
    const deliveriesCount = await prisma.cassetteDelivery.deleteMany({});
    console.log(`   ✅ Deleted ${deliveriesCount.count} cassette deliveries`);

    // Delete CassetteReturns (references cassettes)
    const returnsCount = await prisma.cassetteReturn.deleteMany({});
    console.log(`   ✅ Deleted ${returnsCount.count} cassette returns`);

    // Update ProblemTickets to set cassetteId and machineId to null
    // (We can't delete them because they might have other required fields)
    const problemTicketsUpdated = await prisma.problemTicket.updateMany({
      where: {
        OR: [
          { cassetteId: { not: null } },
          { machineId: { not: null } },
        ],
      },
      data: {
        cassetteId: null,
        machineId: null,
      },
    });
    console.log(`   ✅ Updated ${problemTicketsUpdated.count} problem tickets (set cassetteId and machineId to null)`);

    // Delete MachineIdentifierHistory (has onDelete: Cascade, but let's be explicit)
    const historyCount = await prisma.machineIdentifierHistory.deleteMany({});
    console.log(`   ✅ Deleted ${historyCount.count} machine identifier history records`);

    // Step 2: Delete all cassettes
    console.log('\n📦 Step 2: Deleting all cassettes...');
    const cassettesCount = await prisma.cassette.deleteMany({});
    console.log(`   ✅ Deleted ${cassettesCount.count} cassettes`);

    // Step 3: Delete all machines
    console.log('\n🖥️  Step 3: Deleting all machines...');
    const machinesCount = await prisma.machine.deleteMany({});
    console.log(`   ✅ Deleted ${machinesCount.count} machines`);

    console.log('\n✅ Deletion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Machines deleted: ${machinesCount.count}`);
    console.log(`   - Cassettes deleted: ${cassettesCount.count}`);
    console.log(`   - PM cassette details deleted: ${pmCassetteDetailsCount.count}`);
    console.log(`   - Ticket cassette details deleted: ${ticketCassetteDetailsCount.count}`);
    console.log(`   - Preventive maintenance deleted: ${pmCount.count}`);
    console.log(`   - Repair tickets deleted: ${repairTicketsCount.count}`);
    console.log(`   - Deliveries deleted: ${deliveriesCount.count}`);
    console.log(`   - Returns deleted: ${returnsCount.count}`);
    console.log(`   - Problem tickets updated: ${problemTicketsUpdated.count}`);
    console.log(`   - Identifier history deleted: ${historyCount.count}`);

  } catch (error: any) {
    console.error('\n❌ Error during deletion:', error.message);
    throw error;
  }
}

async function main() {
  // Safety check: ask for confirmation in production
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'production') {
    console.error('❌ Cannot delete data in production environment!');
    console.error('   Set NODE_ENV=development to allow deletion.');
    process.exit(1);
  }

  console.log('⚠️  WARNING: This will delete ALL machines and cassettes from the database!');
  console.log('⚠️  Related data (repair tickets, deliveries, returns) will also be deleted.');
  console.log('⚠️  Problem tickets will have their cassetteId and machineId set to null.\n');

  // In a real scenario, you might want to add a confirmation prompt
  // For now, we'll proceed directly since this is a script
  console.log('🚀 Proceeding with deletion...\n');

  try {
    await deleteAllMachinesAndCassettes();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

