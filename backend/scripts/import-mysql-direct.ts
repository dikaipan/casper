import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

interface SQLRecord {
  No: number;
  'SN Mesin': string;
  'SN Kaset': string;
  'Tipe Kaset': string;
  'utama/cadangan': string;
}

function parseMySQLDump(filePath: string): SQLRecord[] {
  console.log('🔄 Reading MySQL dump file:', filePath);
  
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  const records: SQLRecord[] = [];
  
  // Split by lines
  const lines = sqlContent.split('\n');
  let insideInsert = false;
  let rowCount = 0;
  
  for (let line of lines) {
    // Check if we're starting INSERT
    if (line.includes('INSERT INTO `bni_repair_cassette_monitoring_1_`') && line.includes('VALUES')) {
      insideInsert = true;
      continue;
    }
    
    // If we're inside INSERT, parse each line
    if (insideInsert) {
      // Check if this line ends the current INSERT (ends with semicolon)
      if (line.trim().endsWith(');')) {
        // Process this last row, then reset for next INSERT
        insideInsert = false;
        // Continue to process this line below, don't skip it
      }
      
      // Skip non-data lines
      if (line.trim().startsWith('COMMIT') || line.trim().startsWith('/*!') || line.trim() === '') {
        continue;
      }
      
      // Parse line if it contains data
      line = line.trim();
      if (line.startsWith('(') && (line.endsWith('),') || line.endsWith('),'))) {
        // Remove leading '(' and trailing '),' or '),'
        let rowData = line.slice(1);
        if (rowData.endsWith('),')) {
          rowData = rowData.slice(0, -2);
        } else if (rowData.endsWith(',')) {
          rowData = rowData.slice(0, -1);
        }
        if (rowData.endsWith(')')) {
          rowData = rowData.slice(0, -1);
        }
        
        const values = parseRow(rowData);
        rowCount++;
        
        // Skip header row
        if (values[0] === '0' || values[0] === 0 || values[1] === 'SN Mesin') {
          continue;
        }
        
        const record: SQLRecord = {
          No: parseInt(values[0] as string) || 0,
          'SN Mesin': (values[1] || '').toString().trim(),
          'SN Kaset': (values[2] || '').toString().trim(),
          'Tipe Kaset': (values[3] || '').toString().trim(),
          'utama/cadangan': (values[4] || '').toString().trim(),
        };
        
        if (record['SN Mesin'] && record['SN Kaset']) {
          records.push(record);
        }
      } else if (line.endsWith(');')) {
        // Last row - ends with );
        let rowData = line.slice(1, -2); // Remove '(' and ');'
        
        const values = parseRow(rowData);
        rowCount++;
        
        // Skip header row
        if (values[0] === '0' || values[0] === 0 || values[1] === 'SN Mesin') {
          continue;
        }
        
        const record: SQLRecord = {
          No: parseInt(values[0] as string) || 0,
          'SN Mesin': (values[1] || '').toString().trim(),
          'SN Kaset': (values[2] || '').toString().trim(),
          'Tipe Kaset': (values[3] || '').toString().trim(),
          'utama/cadangan': (values[4] || '').toString().trim(),
        };
        
        if (record['SN Mesin'] && record['SN Kaset']) {
          records.push(record);
        }
        
        // Don't break - continue to look for more INSERT statements
        insideInsert = false;
      }
    }
  }
  
  console.log(`📋 Parsed ${rowCount} rows, extracted ${records.length} valid records\n`);
  
  return records;
}

function parseRow(row: string): any[] {
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === "'" && (i === 0 || row[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        current = '';
      } else {
        inQuote = false;
        values.push(current);
        current = '';
      }
    } else if (char === ',' && !inQuote) {
      if (current !== '') {
        values.push(current);
        current = '';
      }
    } else if (inQuote) {
      current += char;
    } else if (char !== ' ' && char !== ',') {
      current += char;
    }
  }
  
  if (current !== '') {
    values.push(current);
  }
  
  return values;
}

async function importFromSQL(bankCode: string, pengelolaCode: string) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Parse SQL file
    const sqlFile = path.join(__dirname, '../data/cassette_repair_db.sql');
    const records = parseMySQLDump(sqlFile);
    console.log(`📊 Parsed ${records.length} cassette records from SQL\n`);
    
    // Get bank
    const bankResult = await client.query(
      'SELECT * FROM customers_banks WHERE bank_code = $1',
      [bankCode]
    );
    
    if (bankResult.rows.length === 0) {
      throw new Error(`Bank not found: ${bankCode}`);
    }
    const bank = bankResult.rows[0];
    
    // Get vendor
    const vendorResult = await client.query(
      'SELECT * FROM vendors WHERE vendor_code = $1',
      [pengelolaCode]
    );
    
    if (vendorResult.rows.length === 0) {
      throw new Error(`Vendor not found: ${pengelolaCode}`);
    }
    const vendor = vendorResult.rows[0];
    
    console.log(`🏢 Bank: ${bank.bank_name} (${bank.bank_code})`);
    console.log(`🚚 Vendor: ${vendor.company_name} (${vendor.vendor_code})\n`);
    
    // Get cassette types
    const typesResult = await client.query('SELECT * FROM cassette_types');
    const typeMap = new Map<string, any>(typesResult.rows.map(t => [t.type_code, t]));
    
    console.log(`📦 Available cassette types: ${Array.from(typeMap.keys()).join(', ')}\n`);
    
    // Group records by machine
    const machineMap = new Map<string, SQLRecord[]>();
    
    for (const record of records) {
      const machineSN = record['SN Mesin'];
      if (!machineMap.has(machineSN)) {
        machineMap.set(machineSN, []);
      }
      machineMap.get(machineSN)!.push(record);
    }
    
    console.log(`🖥️  Unique machines found: ${machineMap.size}`);
    
    // Show cassette count distribution
    const cassetteCountMap = new Map<number, number>();
    for (const [_, cassettes] of machineMap.entries()) {
      const count = cassettes.length;
      cassetteCountMap.set(count, (cassetteCountMap.get(count) || 0) + 1);
    }
    
    console.log('\n📊 Cassette count per machine:');
    Array.from(cassetteCountMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([count, machines]) => {
        const icon = count === 10 ? '✅' : '⚠️ ';
        console.log(`  ${icon} ${count} cassettes: ${machines} machines`);
      });
    
    // Show machines with != 10 cassettes
    const problematicMachines = Array.from(machineMap.entries())
      .filter(([_, cassettes]) => cassettes.length !== 10);
    
    if (problematicMachines.length > 0) {
      console.log(`\n⚠️  Machines with != 10 cassettes (${problematicMachines.length}):`);
      problematicMachines.slice(0, 5).forEach(([sn, cassettes]) => {
        console.log(`   • ${sn}: ${cassettes.length} cassettes`);
      });
      if (problematicMachines.length > 5) {
        console.log(`   ... and ${problematicMachines.length - 5} more`);
      }
    }
    
    console.log('\n🔄 Importing machines and cassettes...\n');
    
    let machineCount = 0;
    let cassetteCount = 0;
    let skippedCassettes = 0;
    const errors: string[] = [];
    
    for (const [machineSN, cassettes] of machineMap.entries()) {
      try {
        // Check if machine exists
        const existingMachine = await client.query(
          'SELECT * FROM machines WHERE serial_number_manufacturer = $1',
          [machineSN]
        );
        
        let machineId: string;
        
        if (existingMachine.rows.length === 0) {
          // Create machine
          const machineResult = await client.query(
            `INSERT INTO machines 
            (id, serial_number_manufacturer, machine_code, model_name, physical_location, 
             customer_bank_id, vendor_id, status, notes, created_at, updated_at)
            VALUES 
            (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id`,
            [
              machineSN,
              `MCH-${machineSN.slice(-6)}`,
              'ATM Model',
              'Unknown',
              bank.id,
              vendor.id,
              'OPERATIONAL',
              `Imported from MySQL dump - ${cassettes.length} cassettes`
            ]
          );
          
          machineId = machineResult.rows[0].id;
          machineCount++;
        } else {
          machineId = existingMachine.rows[0].id;
        }
        
        // Import cassettes (limit to 10)
        const limitedCassettes = cassettes.slice(0, 10);
        
        for (let i = 0; i < limitedCassettes.length; i++) {
          const cassetteRecord = limitedCassettes[i];
          
          try {
            const cassetteSN = cassetteRecord['SN Kaset'];
            const cassetteTypeCode = cassetteRecord['Tipe Kaset'];
            
            // Determine usage type: first 5 = MAIN, next 5 = BACKUP
            const usageType = i < 5 ? 'MAIN' : 'BACKUP';
            
            // Check if cassette exists
            const existingCassette = await client.query(
              'SELECT * FROM cassettes WHERE serial_number = $1',
              [cassetteSN]
            );
            
            if (existingCassette.rows.length > 0) {
              skippedCassettes++;
              continue;
            }
            
            // Get cassette type
            const cassetteType = typeMap.get(cassetteTypeCode);
            if (!cassetteType) {
              errors.push(`Unknown cassette type: ${cassetteTypeCode} for ${cassetteSN}`);
              skippedCassettes++;
              continue;
            }
            
            // Create cassette
            await client.query(
              `INSERT INTO cassettes 
              (id, serial_number, cassette_type_id, customer_bank_id, machine_id, 
               usage_type, status, notes, created_at, updated_at)
              VALUES 
              (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [
                cassetteSN,
                cassetteType.id,
                bank.id,
                machineId,
                usageType,
                'OK',
                `${usageType} cassette for machine ${machineSN}`
              ]
            );
            
            cassetteCount++;
          } catch (error: any) {
            errors.push(`Failed to import cassette ${cassetteRecord['SN Kaset']}: ${error.message}`);
            skippedCassettes++;
          }
        }
        
        if (machineCount % 100 === 0) {
          console.log(`  ✓ Processed ${machineCount} machines, ${cassetteCount} cassettes...`);
        }
      } catch (error: any) {
        errors.push(`Failed to import machine ${machineSN}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Import completed!');
    console.log('='.repeat(60));
    console.log(`🖥️  Machines imported: ${machineCount}`);
    console.log(`📦 Cassettes imported: ${cassetteCount}`);
    console.log(`⚠️  Cassettes skipped: ${skippedCassettes}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors (showing first 10):`);
      errors.slice(0, 10).forEach(err => console.log(`   • ${err}`));
    }
    
  } catch (error: any) {
    console.error('\n❌ Error during import:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

const bankCode = process.argv[2] || 'BNI';
const pengelolaCode = process.argv[3] || 'VND-TAG-001';

console.log('🚀 MySQL Import Script (Direct Database Access)');
console.log('=================================================');
console.log(`Bank Code: ${bankCode}`);
console.log(`Vendor Code: ${pengelolaCode}\n`);

importFromSQL(bankCode, pengelolaCode)
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

