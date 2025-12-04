import { Client } from 'pg';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function importFromExcel(bankCode: string, pengelolaCode: string) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read Excel file (use fixed version if available, otherwise original)
    let excelFile = path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx');
    
    if (!require('fs').existsSync(excelFile)) {
      excelFile = path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx');
    }
    
    console.log('📄 Reading Excel file:', excelFile);
    
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
    
    console.log(`📊 Parsed ${records.length} records from Excel\n`);
    
    // Get bank
    const bankResult = await client.query(
      'SELECT * FROM customers_banks WHERE bank_code = $1',
      [bankCode]
    );
    
    if (bankResult.rows.length === 0) {
      throw new Error(`Bank not found: ${bankCode}`);
    }
    const bank = bankResult.rows[0];
    
    // Get pengelola
    const pengelolaResult = await client.query(
      'SELECT * FROM pengelola WHERE pengelola_code = $1',
      [pengelolaCode]
    );
    
    if (pengelolaResult.rows.length === 0) {
      throw new Error(`Pengelola not found: ${pengelolaCode}`);
    }
    const pengelola = pengelolaResult.rows[0];
    
    console.log(`🏢 Bank: ${bank.bank_name} (${bank.bank_code})`);
    console.log(`🚚 Pengelola: ${pengelola.company_name} (${pengelola.pengelola_code})\n`);
    
    // Get cassette types
    const typesResult = await client.query('SELECT * FROM cassette_types');
    const typeMap = new Map<string, any>(typesResult.rows.map(t => [t.type_code, t]));
    
    console.log(`📦 Available cassette types: ${Array.from(typeMap.keys()).join(', ')}\n`);
    
    // Group records by machine
    const machineGroups = new Map<string, any[]>();
    
    for (const record of records) {
      const machineSN = String(record['SN Mesin'] || '').trim();
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
      let count = 0;
      for (const record of records) {
        if (String(record['SN Kaset'] || '').trim()) count++;
        if (String(record['SN Kaset Cadangan'] || '').trim()) count++;
      }
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
          let totalCassettes = 0;
          for (const record of records) {
            if (String(record['SN Kaset'] || '').trim()) totalCassettes++;
            if (String(record['SN Kaset Cadangan'] || '').trim()) totalCassettes++;
          }
          
          const machineResult = await client.query(
            `INSERT INTO machines 
            (id, serial_number_manufacturer, machine_code, model_name, physical_location, 
             customer_bank_id, pengelola_id, status, notes, created_at, updated_at)
            VALUES 
            (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id`,
            [
              machineSN,
              `MCH-${machineSN.slice(-6)}`,
              'ATM Model',
              'Unknown',
              bank.id,
              pengelola.id,
              'OPERATIONAL',
              `Imported from Excel - ${Math.min(totalCassettes, 10)} cassettes`
            ]
          );
          
          machineId = machineResult.rows[0].id;
          machineCount++;
        } else {
          machineId = existingMachine.rows[0].id;
        }
        
        // Import cassettes (limit to 5 rows per machine = 10 cassettes max)
        const limitedRecords = records.slice(0, 5);
        
        const mainCassettes: string[] = [];
        const backupCassettes: string[] = [];
        const cassetteTypes: string[] = [];
        
        for (let i = 0; i < limitedRecords.length; i++) {
          const record = limitedRecords[i];
          const mainCassetteSN = String(record['SN Kaset'] || '').trim();
          const backupCassetteSN = String(record['SN Kaset Cadangan'] || '').trim();
          const cassetteType = String(record['Tipe Kaset'] || '').trim();
          
          if (mainCassetteSN) {
            mainCassettes.push(mainCassetteSN);
            cassetteTypes.push(cassetteType || 'AB');
          }
          
          if (backupCassetteSN) {
            backupCassettes.push(backupCassetteSN);
          }
        }
        
        // Import MAIN cassettes
        for (let i = 0; i < mainCassettes.length; i++) {
          const cassetteSN = mainCassettes[i];
          
          if (processedCassettes.has(cassetteSN)) {
            skippedCassettes++;
            continue;
          }
          
          try {
            const cassetteTypeCode = cassetteTypes[i] || 'AB';
            const cassetteType = typeMap.get(cassetteTypeCode);
            
            if (!cassetteType) {
              errors.push(`Unknown cassette type: ${cassetteTypeCode} for ${cassetteSN}`);
              skippedCassettes++;
              continue;
            }
            
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
              skippedCassettes++;
            } else {
              errors.push(`Failed to import cassette ${cassetteSN}: ${error.message}`);
              skippedCassettes++;
            }
          }
        }
        
        // Import BACKUP cassettes
        for (let i = 0; i < backupCassettes.length; i++) {
          const cassetteSN = backupCassettes[i];
          
          if (processedCassettes.has(cassetteSN)) {
            skippedCassettes++;
            continue;
          }
          
          try {
            const cassetteTypeCode = cassetteTypes[i] || 'AB';
            const cassetteType = typeMap.get(cassetteTypeCode);
            
            if (!cassetteType) {
              errors.push(`Unknown cassette type: ${cassetteTypeCode} for ${cassetteSN}`);
              skippedCassettes++;
              continue;
            }
            
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
              skippedCassettes++;
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

console.log('🚀 Excel Import Script (Direct Database Access)');
console.log('=================================================');
console.log(`Bank Code: ${bankCode}`);
console.log(`Vendor Code: ${pengelolaCode}\n`);

importFromExcel(bankCode, pengelolaCode)
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

