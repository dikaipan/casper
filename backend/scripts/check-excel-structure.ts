import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const excelFilePath = path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) (1).xlsx');

console.log('🔍 Checking Excel File Structure...\n');
console.log(`📄 File: ${excelFilePath}\n`);

if (!fs.existsSync(excelFilePath)) {
  console.error('❌ File not found!');
  process.exit(1);
}

// Read Excel file
const workbook = XLSX.readFile(excelFilePath);
console.log(`📊 Sheet names: ${workbook.SheetNames.join(', ')}\n`);

// Try both sheets
for (const sheetName of workbook.SheetNames) {
  console.log(`\n📄 Sheet: "${sheetName}"\n`);
  const worksheet = workbook.Sheets[sheetName];

  // Get first 10 rows to see structure
  const records = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 }) as any[];
  
  if (records.length > 0) {
    console.log('📋 First 5 rows (raw):\n');
    records.slice(0, 5).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
  }

  console.log('\n📋 First 5 rows (as object):\n');
  const recordsAsObject = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];
  
  if (recordsAsObject.length > 0) {
    recordsAsObject.slice(0, 5).forEach((row, i) => {
      console.log(`Row ${i + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
      });
      console.log('');
    });

    // Check for specific machine
    console.log('🔍 Looking for machine: 74UEA43N03-069520\n');
    const machineRecords = recordsAsObject.filter((row: any) => {
      const allKeys = Object.keys(row);
      for (const key of allKeys) {
        const value = String(row[key] || '').trim();
        if (value === '74UEA43N03-069520') {
          return true;
        }
      }
      return false;
    });

    console.log(`Found ${machineRecords.length} rows for this machine:\n`);
    if (machineRecords.length > 0) {
      machineRecords.forEach((row, i) => {
        console.log(`Row ${i + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
        console.log('');
      });
    }
  } else {
    console.log('⚠️  No data found in this sheet\n');
  }
}

