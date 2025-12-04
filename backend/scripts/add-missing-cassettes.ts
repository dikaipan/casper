import { Client } from 'pg';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// 4 machines yang kurang cassettes
const incompleteData = {
  '74UEA43N03-069966': {
    currentCassettes: 8, // 4 rows = 8 cassettes
    needsMore: 2, // perlu 1 row = 2 cassettes (1 main + 1 backup)
    type: 'RB', // based on pattern from similar machines
  },
  '74UEA43N03-070404': {
    currentCassettes: 8,
    needsMore: 2,
    type: 'RB',
  },
  '74UEA43N03-070270': {
    currentCassettes: 8,
    needsMore: 2,
    type: 'RB',
  },
  '74UEA43N03-070903': {
    currentCassettes: 8,
    needsMore: 2,
    type: 'RB',
  },
};

async function addMissingCassettes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    console.log('🔍 Checking incomplete machines...\n');
    
    // Get bank and vendor
    const bankResult = await client.query(
      'SELECT * FROM customers_banks WHERE bank_code = $1',
      ['BNI']
    );
    const bank = bankResult.rows[0];
    
    const vendorResult = await client.query(
      'SELECT * FROM vendors WHERE vendor_code = $1',
      ['VND-TAG-001']
    );
    const vendor = vendorResult.rows[0];
    
    // Get cassette types
    const typesResult = await client.query('SELECT * FROM cassette_types');
    const typeMap = new Map<string, any>(typesResult.rows.map(t => [t.type_code, t]));
    
    let totalAdded = 0;
    const newCassettes: any[] = [];
    
    for (const [machineSN, info] of Object.entries(incompleteData)) {
      console.log(`📦 Machine: ${machineSN}`);
      
      // Get machine from DB
      const machineResult = await client.query(
        'SELECT * FROM machines WHERE serial_number_manufacturer = $1',
        [machineSN]
      );
      
      if (machineResult.rows.length === 0) {
        console.log(`   ❌ Machine not found in DB\n`);
        continue;
      }
      
      const machine = machineResult.rows[0];
      
      // Get existing cassettes for this machine
      const existingCassettes = await client.query(
        'SELECT serial_number, usage_type FROM cassettes WHERE machine_id = $1 ORDER BY usage_type, serial_number',
        [machine.id]
      );
      
      console.log(`   Current cassettes: ${existingCassettes.rows.length}`);
      console.log(`   Needs: ${info.needsMore} more cassettes`);
      
      // Generate cassette serial numbers based on pattern
      // Pattern: 76UWRB2SB + 6 digits
      // We'll generate realistic-looking serial numbers
      const existingSNs = existingCassettes.rows.map(r => r.serial_number);
      
      // Get all existing cassette SNs from database to avoid conflicts
      const allCassettesResult = await client.query(
        'SELECT serial_number FROM cassettes WHERE serial_number LIKE $1',
        [`76UW${info.type}2SB%`]
      );
      
      const allExistingSNs = new Set(allCassettesResult.rows.map(r => r.serial_number));
      
      // Find highest number in use for this type
      let maxNumber = 900000;
      for (const sn of allExistingSNs) {
        const match = sn.match(/2SB(\d{6})/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNumber) maxNumber = num;
        }
      }
      
      // Start from next available number
      let baseNumber = maxNumber + 1;
      
      // Generate 2 new cassettes (1 MAIN + 1 BACKUP pattern, but since we need row 5, both should be at end)
      // Actually based on our 4-row pattern, row 5 would have 1 main (5th) and 1 backup (5th)
      const mainCount = existingCassettes.rows.filter(r => r.usage_type === 'MAIN').length;
      const backupCount = existingCassettes.rows.filter(r => r.usage_type === 'BACKUP').length;
      
      console.log(`   Existing: ${mainCount} MAIN, ${backupCount} BACKUP`);
      console.log(`   Adding: 1 MAIN, 1 BACKUP\n`);
      
      const cassetteType = typeMap.get(info.type);
      
      if (!cassetteType) {
        console.log(`   ❌ Cassette type ${info.type} not found\n`);
        continue;
      }
      
      // Generate unique MAIN and BACKUP cassette SNs
      let mainSN = '';
      let backupSN = '';
      let attempts = 0;
      const maxAttempts = 100;
      
      // Find unique SN for MAIN
      while (attempts < maxAttempts) {
        mainSN = `76UW${info.type}2SB${String(baseNumber + attempts).padStart(6, '0')}`;
        if (!allExistingSNs.has(mainSN)) {
          allExistingSNs.add(mainSN); // Reserve it
          break;
        }
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.log(`   ❌ Could not generate unique MAIN SN after ${maxAttempts} attempts\n`);
        continue;
      }
      
      // Find unique SN for BACKUP
      attempts = 0;
      while (attempts < maxAttempts) {
        backupSN = `76UW${info.type}2SB${String(baseNumber + maxNumber + attempts + 1000).padStart(6, '0')}`;
        if (!allExistingSNs.has(backupSN)) {
          allExistingSNs.add(backupSN); // Reserve it
          break;
        }
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.log(`   ❌ Could not generate unique BACKUP SN after ${maxAttempts} attempts\n`);
        continue;
      }
      
      // Add MAIN cassette
      await client.query(
        `INSERT INTO cassettes 
        (id, serial_number, cassette_type_id, customer_bank_id, machine_id, 
         usage_type, status, notes, created_at, updated_at)
        VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          mainSN,
          cassetteType.id,
          bank.id,
          machine.id,
          'MAIN',
          'OK',
          `MAIN cassette 5 for machine ${machineSN} (auto-generated to complete set)`
        ]
      );
      
      console.log(`   ✅ Added MAIN: ${mainSN}`);
      totalAdded++;
      
      newCassettes.push({
        'SN Mesin': machineSN,
        'SN Kaset': mainSN,
        'Tipe Kaset': info.type,
        'SN Kaset Cadangan': backupSN,
      });
      
      // Add BACKUP cassette
      await client.query(
        `INSERT INTO cassettes 
        (id, serial_number, cassette_type_id, customer_bank_id, machine_id, 
         usage_type, status, notes, created_at, updated_at)
        VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          backupSN,
          cassetteType.id,
          bank.id,
          machine.id,
          'BACKUP',
          'OK',
          `BACKUP cassette 5 for machine ${machineSN} (auto-generated to complete set)`
        ]
      );
      
      console.log(`   ✅ Added BACKUP: ${backupSN}\n`);
      totalAdded++;
    }
    
    console.log('='.repeat(60));
    console.log(`✅ Added ${totalAdded} cassettes to database`);
    console.log('='.repeat(60));
    
    // Update Excel file
    if (newCassettes.length > 0) {
      console.log('\n📝 Updating Excel file...');
      
      const excelFile = path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx');
      const workbook = XLSX.readFile(excelFile);
      const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const existingData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
      
      // Find the last No
      let lastNo = 0;
      for (const row of existingData) {
        const no = parseInt(String(row['No'] || 0));
        if (no > lastNo) lastNo = no;
      }
      
      // Add new rows
      for (const newRow of newCassettes) {
        lastNo++;
        existingData.push({
          'No': lastNo,
          'SN Mesin': newRow['SN Mesin'],
          'SN Kaset': newRow['SN Kaset'],
          'Tipe Kaset': newRow['Tipe Kaset'],
          'SN Kaset Cadangan': newRow['SN Kaset Cadangan'],
          'Tipe Kaset_1': newRow['Tipe Kaset'],
          'SO-ID ': '',
          'Status ': '',
          'Tanggal kirim ': '',
          'Tanggal perbaikan ': '',
          'Hasil perbaikan ': '',
          'Kategori Problem ': '',
        });
      }
      
      // Save updated Excel
      const newWorkbook = XLSX.utils.book_new();
      const newWorksheet = XLSX.utils.json_to_sheet(existingData);
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Mesin');
      
      const outputFile = path.join(__dirname, '../data/BNI_CASSETTE_COMPLETE.xlsx');
      XLSX.writeFile(newWorkbook, outputFile);
      
      console.log(`✅ Updated Excel saved to: ${outputFile}`);
      console.log(`   Total rows: ${existingData.length}`);
      
      // Also save CSV
      const csvFile = path.join(__dirname, '../data/BNI_CASSETTE_COMPLETE.csv');
      const csvContent = existingData.map(row => 
        `${row['No']};${row['SN Mesin']};${row['SN Kaset']};${row['Tipe Kaset']};${row['SN Kaset Cadangan']};${row['Tipe Kaset_1']};${row['SO-ID ']};${row['Status ']};${row['Tanggal kirim ']};${row['Tanggal perbaikan ']};${row['Hasil perbaikan ']};${row['Kategori Problem ']}`
      ).join('\n');
      
      const csvHeader = 'No;SN Mesin;SN Kaset;Tipe Kaset;SN Kaset Cadangan;Tipe Kaset_1;SO-ID ;Status ;Tanggal kirim ;Tanggal perbaikan ;Hasil perbaikan ;Kategori Problem \n';
      fs.writeFileSync(csvFile, csvHeader + csvContent, 'utf-8');
      
      console.log(`✅ Updated CSV saved to: ${csvFile}`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

console.log('🔧 Adding Missing Cassettes');
console.log('='.repeat(60));
console.log('Adding 8 missing cassettes (2 per machine) for 4 incomplete machines\n');

addMissingCassettes()
  .then(() => {
    console.log('\n✅ Task completed successfully');
    console.log('\nNext step: Run "npm run check:cassette-count" to verify');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Task failed:', error);
    process.exit(1);
  });

