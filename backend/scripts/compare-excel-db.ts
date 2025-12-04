import { Client } from 'pg';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function compareData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read Excel file
    const excelFilePath = path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx');
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
    
    // Group Excel data by machine
    const excelMachines = new Map<string, any[]>();
    for (const record of excelData) {
      const machineSN = String(record['SN Mesin'] || '').trim();
      if (!machineSN) continue;
      
      if (!excelMachines.has(machineSN)) {
        excelMachines.set(machineSN, []);
      }
      excelMachines.get(machineSN)!.push(record);
    }
    
    // Get machines from database
    const dbResult = await client.query(
      'SELECT serial_number_manufacturer FROM machines ORDER BY serial_number_manufacturer'
    );
    const dbMachines = new Set(dbResult.rows.map(r => r.serial_number_manufacturer));
    
    console.log(`📊 Excel machines: ${excelMachines.size}`);
    console.log(`📊 DB machines: ${dbMachines.size}\n`);
    
    // Find NEW machines in Excel (not in DB)
    const newMachines: string[] = [];
    for (const machineSN of excelMachines.keys()) {
      if (!dbMachines.has(machineSN)) {
        newMachines.push(machineSN);
      }
    }
    
    if (newMachines.length > 0) {
      console.log(`🆕 NEW machines in Excel (${newMachines.length}):`);
      for (const machineSN of newMachines) {
        const records = excelMachines.get(machineSN)!;
        let cassetteCount = 0;
        for (const record of records) {
          if (String(record['SN Kaset'] || '').trim()) cassetteCount++;
          if (String(record['SN Kaset Cadangan'] || '').trim()) cassetteCount++;
        }
        console.log(`  • ${machineSN}: ${records.length} rows, ${cassetteCount} cassettes`);
      }
      console.log('');
    }
    
    // Find machines with 12 cassettes in Excel
    console.log('⚠️  Machines with 12 cassettes in Excel:');
    for (const [machineSN, records] of excelMachines.entries()) {
      let cassetteCount = 0;
      for (const record of records) {
        if (String(record['SN Kaset'] || '').trim()) cassetteCount++;
        if (String(record['SN Kaset Cadangan'] || '').trim()) cassetteCount++;
      }
      
      if (cassetteCount === 12) {
        console.log(`  • ${machineSN}: ${records.length} rows`);
        records.forEach((rec, i) => {
          const mainCassette = rec['SN Kaset'] || '';
          const backupCassette = rec['SN Kaset Cadangan'] || '';
          console.log(`    Row ${i + 1}: Kaset="${mainCassette}", Cadangan="${backupCassette}"`);
        });
      }
    }
    
    // Find machines with 8 cassettes (still missing data)
    console.log('\n⚠️  Machines with 8 cassettes (still missing data):');
    for (const [machineSN, records] of excelMachines.entries()) {
      let cassetteCount = 0;
      for (const record of records) {
        if (String(record['SN Kaset'] || '').trim()) cassetteCount++;
        if (String(record['SN Kaset Cadangan'] || '').trim()) cassetteCount++;
      }
      
      if (cassetteCount === 8) {
        console.log(`  • ${machineSN}: ${records.length} rows, ${cassetteCount} cassettes`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

compareData()
  .then(() => {
    console.log('\n✅ Comparison completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

