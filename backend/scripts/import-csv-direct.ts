import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';

dotenv.config();

interface CSVRecord {
  No: string;
  'SN Mesin': string;
  'SN Kaset': string;
  'Tipe Kaset': string;
  'SN Kaset Cadangan': string;
}

async function importFromCSV(bankCode: string, pengelolaCode: string) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read and parse CSV
    const csvFile = path.join(__dirname, '../data/BNI CASSETTE MONITORING .csv');
    console.log('📄 Reading CSV file:', csvFile);
    
    const csvContent = fs.readFileSync(csvFile, 'utf-8');
    
    // Auto-detect delimiter
    const firstLine = csvContent.split('\n')[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';
    console.log('🔍 Detected delimiter:', delimiter === ';' ? 'semicolon' : 'comma');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
      bom: true,
      delimiter: delimiter,
    }) as CSVRecord[];
    
    console.log(`📊 Parsed ${records.length} records from CSV\n`);
    
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
    // Format: 5 rows per machine
    // Each row has 2 cassettes: "SN Kaset" (MAIN) and "SN Kaset Cadangan" (BACKUP)
    const machineGroups = new Map<string, CSVRecord[]>();
    
    for (const record of records) {
      const machineSN = record['SN Mesin']?.trim();
      if (!machineSN) continue;
      
      if (!machineGroups.has(machineSN)) {
        machineGroups.set(machineSN, []);
      }
      
      machineGroups.get(machineSN)!.push(record);
    }
    
    console.log(`🖥️  Unique machines found: ${machineGroups.size}`);
    
    // Show cassette count distribution
    const cassetteCountMap = new Map<number, number>();
    for (const [_, records] of machineGroups.entries()) {
      // Each record has 2 cassettes (SN Kaset + SN Kaset Cadangan)
      const count = records.length * 2;
      cassetteCountMap.set(count, (cassetteCountMap.get(count) || 0) + 1);
    }
    
    console.log('\n📊 Cassette count per machine:');
    Array.from(cassetteCountMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([count, machines]) => {
        const icon = count === 10 ? '✅' : '⚠️ ';
        console.log(`  ${icon} ${count} cassettes: ${machines} machines`);
      });
    
    console.log('\n🔄 Importing machines and cassettes...\n');
    
    let machineCount = 0;
    let cassetteCount = 0;
    let skippedCassettes = 0;
    const errors: string[] = [];
    
    // Track processed cassette SNs to prevent duplicates
    const processedCassettes = new Set<string>();
    
    for (const [machineSN, records] of machineGroups.entries()) {
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
              `Imported from CSV - ${Math.min(records.length * 2, 10)} cassettes`
            ]
          );
          
          machineId = machineResult.rows[0].id;
          machineCount++;
        } else {
          machineId = existingMachine.rows[0].id;
        }
        
        // Import cassettes
        // Format: 5 rows per machine
        // Row 1-5: "SN Kaset" = MAIN cassettes (positions 1-5)
        // Row 1-5: "SN Kaset Cadangan" = BACKUP cassettes (positions 6-10)
        
        const mainCassettes: string[] = [];
        const backupCassettes: string[] = [];
        const cassetteTypes: string[] = [];
        
        for (let i = 0; i < Math.min(records.length, 5); i++) {
          const record = records[i];
          const mainCassetteSN = record['SN Kaset']?.trim();
          const backupCassetteSN = record['SN Kaset Cadangan']?.trim();
          const cassetteType = record['Tipe Kaset']?.trim();
          
          if (mainCassetteSN) {
            mainCassettes.push(mainCassetteSN);
            cassetteTypes.push(cassetteType || 'AB');
          }
          
          if (backupCassetteSN) {
            backupCassettes.push(backupCassetteSN);
          }
        }
        
        // Import MAIN cassettes (positions 1-5)
        for (let i = 0; i < mainCassettes.length; i++) {
          const cassetteSN = mainCassettes[i];
          
          // Skip if already processed (prevent duplicates)
          if (processedCassettes.has(cassetteSN)) {
            skippedCassettes++;
            console.warn(`⚠️  Skipping duplicate cassette: ${cassetteSN}`);
            continue;
          }
          
          try {
            // Get cassette type (try from array first, then auto-detect)
            const cassetteTypeCode = cassetteTypes[i] || 'AB';
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
                'MAIN',
                'OK',
                `MAIN cassette ${i + 1} for machine ${machineSN}`
              ]
            );
            
            processedCassettes.add(cassetteSN);
            cassetteCount++;
          } catch (error: any) {
            if (error.code === '23505') {
              // Duplicate key error
              skippedCassettes++;
              console.warn(`⚠️  Cassette already exists: ${cassetteSN}`);
            } else {
              errors.push(`Failed to import cassette ${cassetteSN}: ${error.message}`);
              skippedCassettes++;
            }
          }
        }
        
        // Import BACKUP cassettes (positions 6-10)
        for (let i = 0; i < backupCassettes.length; i++) {
          const cassetteSN = backupCassettes[i];
          
          // Skip if already processed (prevent duplicates)
          if (processedCassettes.has(cassetteSN)) {
            skippedCassettes++;
            console.warn(`⚠️  Skipping duplicate cassette: ${cassetteSN}`);
            continue;
          }
          
          try {
            // Get cassette type (try from array first, then auto-detect)
            const cassetteTypeCode = cassetteTypes[i] || 'AB';
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
                'BACKUP',
                'OK',
                `BACKUP cassette ${i + 1} for machine ${machineSN}`
              ]
            );
            
            processedCassettes.add(cassetteSN);
            cassetteCount++;
          } catch (error: any) {
            if (error.code === '23505') {
              // Duplicate key error
              skippedCassettes++;
              console.warn(`⚠️  Cassette already exists: ${cassetteSN}`);
            } else {
              errors.push(`Failed to import cassette ${cassetteSN}: ${error.message}`);
              skippedCassettes++;
            }
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

console.log('🚀 CSV Import Script (Direct Database Access)');
console.log('=================================================');
console.log(`Bank Code: ${bankCode}`);
console.log(`Vendor Code: ${pengelolaCode}\n`);

importFromCSV(bankCode, pengelolaCode)
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

