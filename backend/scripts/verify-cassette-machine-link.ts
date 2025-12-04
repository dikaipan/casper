import { Client } from 'pg';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function verifyCassetteMachineLink() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read Excel file to get expected mapping (use COMPLETE if available, otherwise FIXED)
    let excelFile = path.join(__dirname, '../data/BNI_CASSETTE_COMPLETE.xlsx');
    
    if (!require('fs').existsSync(excelFile)) {
      excelFile = path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx');
    }
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
    
    console.log('📄 Loaded Excel data for verification\n');
    
    // Build expected mapping: cassette SN -> machine SN
    const expectedMapping = new Map<string, string>();
    
    for (const record of excelData) {
      const machineSN = String(record['SN Mesin'] || '').trim();
      const mainCassetteSN = String(record['SN Kaset'] || '').trim();
      const backupCassetteSN = String(record['SN Kaset Cadangan'] || '').trim();
      
      if (mainCassetteSN && machineSN) {
        expectedMapping.set(mainCassetteSN, machineSN);
      }
      
      if (backupCassetteSN && machineSN) {
        expectedMapping.set(backupCassetteSN, machineSN);
      }
    }
    
    console.log(`📊 Expected cassette-machine mappings: ${expectedMapping.size}\n`);
    
    // Get actual mapping from database
    const query = `
      SELECT 
        c.serial_number as cassette_sn,
        m.serial_number_manufacturer as machine_sn,
        c.usage_type,
        m.machine_code
      FROM cassettes c
      JOIN machines m ON c.machine_id = m.id
      ORDER BY m.serial_number_manufacturer, c.usage_type, c.serial_number
    `;
    
    const result = await client.query(query);
    
    console.log(`📦 Database cassettes with machine links: ${result.rows.length}\n`);
    
    // Verify mappings
    let correctMappings = 0;
    let incorrectMappings = 0;
    const mismatches: any[] = [];
    
    for (const row of result.rows) {
      const cassetteSN = row.cassette_sn;
      const actualMachineSN = row.machine_sn;
      const expectedMachineSN = expectedMapping.get(cassetteSN);
      
      if (!expectedMachineSN) {
        // Cassette exists in DB but not in Excel (unexpected)
        incorrectMappings++;
        mismatches.push({
          cassetteSN,
          expectedMachineSN: 'NOT IN EXCEL',
          actualMachineSN,
          usageType: row.usage_type,
        });
      } else if (expectedMachineSN === actualMachineSN) {
        // Correct mapping
        correctMappings++;
      } else {
        // Mismatch!
        incorrectMappings++;
        mismatches.push({
          cassetteSN,
          expectedMachineSN,
          actualMachineSN,
          usageType: row.usage_type,
        });
      }
    }
    
    console.log('=' .repeat(70));
    console.log('🔍 VERIFICATION RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Correct mappings: ${correctMappings} / ${result.rows.length} (${(correctMappings / result.rows.length * 100).toFixed(2)}%)`);
    console.log(`❌ Incorrect mappings: ${incorrectMappings}`);
    
    if (mismatches.length > 0) {
      console.log(`\n⚠️  MISMATCHES FOUND (showing first 10):`);
      mismatches.slice(0, 10).forEach((mismatch, i) => {
        console.log(`\n  ${i + 1}. Cassette: ${mismatch.cassetteSN} (${mismatch.usageType})`);
        console.log(`     Expected Machine: ${mismatch.expectedMachineSN}`);
        console.log(`     Actual Machine:   ${mismatch.actualMachineSN}`);
      });
      
      if (mismatches.length > 10) {
        console.log(`\n  ... and ${mismatches.length - 10} more mismatches`);
      }
    } else {
      console.log(`\n🎉 PERFECT! All cassettes are correctly linked to their machines!`);
    }
    
    // Show sample correct mappings
    console.log(`\n✅ Sample correct mappings (first 5):`);
    let sampleCount = 0;
    for (const row of result.rows) {
      if (sampleCount >= 5) break;
      
      const cassetteSN = row.cassette_sn;
      const actualMachineSN = row.machine_sn;
      const expectedMachineSN = expectedMapping.get(cassetteSN);
      
      if (expectedMachineSN === actualMachineSN) {
        console.log(`  ✓ Cassette ${cassetteSN} (${row.usage_type}) → Machine ${actualMachineSN}`);
        sampleCount++;
      }
    }
    
    // Group by machine and show cassette counts
    console.log(`\n📊 Sample machines with their cassettes (first 3):`);
    
    const machineQuery = `
      SELECT 
        m.serial_number_manufacturer,
        m.machine_code,
        COUNT(c.id) as cassette_count,
        STRING_AGG(c.serial_number, ', ' ORDER BY c.usage_type, c.serial_number) as cassettes
      FROM machines m
      LEFT JOIN cassettes c ON c.machine_id = m.id
      GROUP BY m.id, m.serial_number_manufacturer, m.machine_code
      ORDER BY m.serial_number_manufacturer
      LIMIT 3
    `;
    
    const machineResult = await client.query(machineQuery);
    
    for (const machine of machineResult.rows) {
      console.log(`\n  Machine: ${machine.serial_number_manufacturer} (${machine.machine_code})`);
      console.log(`  Cassette count: ${machine.cassette_count}`);
      const cassettes = machine.cassettes ? machine.cassettes.split(', ') : [];
      cassettes.slice(0, 5).forEach((c: string, i: number) => {
        console.log(`    ${i + 1}. ${c}`);
      });
      if (cassettes.length > 5) {
        console.log(`    ... and ${cassettes.length - 5} more`);
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

console.log('🔍 Verifying Cassette-Machine Links');
console.log('='.repeat(70));
console.log('Checking if each cassette (SN Kaset) is correctly linked to');
console.log('its corresponding machine (SN Mesin) in the database.\n');

verifyCassetteMachineLink()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });

