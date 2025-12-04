import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyRename() {
  console.log('🔄 Applying column rename migration...\n');
  
  try {
    // Execute rename command directly
    await prisma.$executeRawUnsafe(`
      ALTER TABLE cassette_types 
      RENAME COLUMN type_name TO machine_type
    `);
    
    console.log('✅ Column renamed successfully: type_name → machine_type\n');
    
    // Verify the change
    const types = await prisma.$queryRaw`
      SELECT type_code, machine_type, description 
      FROM cassette_types 
      ORDER BY type_code
    `;
    
    console.log('📊 Current Cassette Types:');
    console.table(types);
    
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      console.log('ℹ️  Column already renamed or does not exist');
      
      // Try to verify current state
      const types = await prisma.$queryRaw`
        SELECT type_code, machine_type, description 
        FROM cassette_types 
        ORDER BY type_code
      `;
      
      console.log('\n📊 Current Cassette Types:');
      console.table(types);
    } else {
      console.error('❌ Error applying migration:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyRename().catch(console.error);

