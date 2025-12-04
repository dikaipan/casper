import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing enum values...');

  // Update cassettes
  const cassetteResult = await prisma.$executeRaw`
    UPDATE cassettes 
    SET status = 'OK' 
    WHERE status = 'INSTALLED' OR status = 'SPARE_POOL'
  `;
  console.log(`✅ Updated ${cassetteResult} cassettes`);

  // Update problem_tickets
  const ticketResult = await prisma.$executeRaw`
    UPDATE problem_tickets
    SET status = 'OPEN'
    WHERE status = 'APPROVED' OR status = 'PENDING_VENDOR' OR status = 'PENDING_RC'
  `;
  console.log(`✅ Updated ${ticketResult} problem tickets`);

  console.log('✅ Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

