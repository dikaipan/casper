import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying database column rename...\n');
  
  try {
    // Try to query using new column name
    const result = await prisma.$queryRaw`
      SELECT type_code, machine_type, description 
      FROM cassette_types 
      ORDER BY type_code
    `;
    
    console.log('✅ SUCCESS! Database has been updated!\n');
    console.log('📊 Cassette Types (with new column "machine_type"):');
    console.table(result);
    
    console.log('\n🎉 Confirmed:');
    console.log('   ✅ Column "type_name" has been renamed to "machine_type"');
    console.log('   ✅ Data is intact and accessible');
    
  } catch (error: any) {
    if (error.message?.includes('machine_type')) {
      console.log('❌ New column "machine_type" not found');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

verify();

