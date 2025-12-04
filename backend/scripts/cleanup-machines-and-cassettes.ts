import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠️ WARNING: This script will DELETE ALL Machines and Cassettes from the database, including related tickets and deliveries/returns.');

  // Hapus data yang berelasi terlebih dahulu untuk menghindari error foreign key
  console.log('Deleting CassetteDeliveries...');
  await prisma.cassetteDelivery.deleteMany({});

  console.log('Deleting CassetteReturns...');
  await prisma.cassetteReturn.deleteMany({});

  console.log('Deleting RepairTickets...');
  await prisma.repairTicket.deleteMany({});

  console.log('Deleting ProblemTickets...');
  await prisma.problemTicket.deleteMany({});

  // Sekarang aman untuk hapus semua kaset dan mesin
  console.log('Deleting Cassettes...');
  await prisma.cassette.deleteMany({});

  console.log('Deleting Machines...');
  await prisma.machine.deleteMany({});

  console.log('✅ Done. All Machines, Cassettes, and related tickets/deliveries/returns have been deleted.');
}

main()
  .catch((e) => {
    console.error('❌ Error while cleaning up Machines & Cassettes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
