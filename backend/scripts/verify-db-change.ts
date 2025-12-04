import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'hcm_development',
  user: 'postgres',
  password: 'postgres',
});

async function verifyChange() {
  try {
    await client.connect();
    console.log('🔍 Verifying database changes...\n');
    
    // Check if column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cassette_types' 
      AND column_name IN ('type_name', 'machine_type')
    `);
    
    console.log('📋 Columns in cassette_types table:');
    console.table(columnCheck.rows);
    
    // Get cassette types data
    const data = await client.query(`
      SELECT type_code, machine_type, description 
      FROM cassette_types 
      ORDER BY type_code
    `);
    
    console.log('\n📊 Cassette Types Data:');
    console.table(data.rows);
    
    // Summary
    const hasOldColumn = columnCheck.rows.some(r => r.column_name === 'type_name');
    const hasNewColumn = columnCheck.rows.some(r => r.column_name === 'machine_type');
    
    console.log('\n🎯 Summary:');
    if (hasOldColumn) {
      console.log('❌ Old column "type_name" still exists');
    } else {
      console.log('✅ Old column "type_name" has been removed');
    }
    
    if (hasNewColumn) {
      console.log('✅ New column "machine_type" exists');
    } else {
      console.log('❌ New column "machine_type" does not exist');
    }
    
    if (!hasOldColumn && hasNewColumn) {
      console.log('\n🎉 DATABASE SUCCESSFULLY UPDATED!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verifyChange();

