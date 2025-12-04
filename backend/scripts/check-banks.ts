import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBanks() {
  try {
    const banks = await prisma.customerBank.findMany();
    console.log('Banks:');
    banks.forEach(b => console.log(`  - ${b.bankCode}: ${b.bankName}`));
    
    const pengelola = await prisma.pengelola.findMany();
    console.log('\nPengelola:');
    pengelola.forEach(p => console.log(`  - ${p.pengelolaCode}: ${p.companyName}`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBanks();

