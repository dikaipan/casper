import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFilePath = path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx');

console.log('🔍 Reading Excel file:', excelFilePath);

// Read Excel file
const workbook = XLSX.readFile(excelFilePath);

console.log('📋 Sheet names:', workbook.SheetNames);

// Try to read "Mesin" sheet, otherwise use first sheet
const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
console.log('📄 Reading sheet:', sheetName);

const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

console.log('\n📊 Total records:', data.length);
console.log('📋 Columns:', Object.keys(data[0] || {}));

console.log('\n🔍 First 5 records:');
data.slice(0, 5).forEach((record: any, i) => {
  console.log(`\nRecord ${i + 1}:`, JSON.stringify(record, null, 2));
});

// Group by machine
const machineGroups = new Map<string, any[]>();

for (const record of data as any[]) {
  // Try different possible column names for machine SN
  const machineSN = record['SN Mesin'] || record['SN_Mesin'] || record['Machine SN'] || record['Serial Number'];
  
  if (!machineSN || String(machineSN).trim() === '') continue;
  
  const trimmedSN = String(machineSN).trim();
  
  if (!machineGroups.has(trimmedSN)) {
    machineGroups.set(trimmedSN, []);
  }
  
  machineGroups.get(trimmedSN)!.push(record);
}

console.log('\n🖥️  Total unique machines:', machineGroups.size);

// Count cassettes per machine (assuming each row has 2 cassettes: SN Kaset + SN Kaset Cadangan)
const cassetteCountMap = new Map<number, number>();

for (const [_, records] of machineGroups.entries()) {
  // Count non-empty cassette serial numbers
  let cassetteCount = 0;
  
  for (const record of records) {
    // Check for main cassette
    const mainCassette = record['SN Kaset'] || record['SN_Kaset'] || record['Cassette SN'];
    if (mainCassette && String(mainCassette).trim() !== '') {
      cassetteCount++;
    }
    
    // Check for backup cassette
    const backupCassette = record['SN Kaset Cadangan'] || record['SN_Kaset_Cadangan'] || record['Backup Cassette SN'];
    if (backupCassette && String(backupCassette).trim() !== '') {
      cassetteCount++;
    }
  }
  
  cassetteCountMap.set(cassetteCount, (cassetteCountMap.get(cassetteCount) || 0) + 1);
}

console.log('\n📊 Cassette count per machine:');
Array.from(cassetteCountMap.entries())
  .sort((a, b) => a[0] - b[0])
  .forEach(([count, machines]) => {
    const icon = count === 10 ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${count} cassettes: ${machines} machines`);
  });

// Show first 3 machines
console.log('\n🔍 First 3 machines with their records:');
let machineCount = 0;
for (const [machineSN, records] of machineGroups.entries()) {
  if (machineCount >= 3) break;
  
  console.log(`\n  Machine: ${machineSN}`);
  console.log(`  Records: ${records.length} rows`);
  
  records.forEach((rec, i) => {
    const mainCassette = rec['SN Kaset'] || rec['SN_Kaset'] || rec['Cassette SN'] || '';
    const backupCassette = rec['SN Kaset Cadangan'] || rec['SN_Kaset_Cadangan'] || rec['Backup Cassette SN'] || '';
    const cassetteType = rec['Tipe Kaset'] || rec['Tipe_Kaset'] || rec['Type'] || '';
    
    console.log(`    Row ${i + 1}: Kaset="${mainCassette}", Cadangan="${backupCassette}", Tipe="${cassetteType}"`);
  });
  
  machineCount++;
}

// Check for the 4 problematic machines
console.log('\n🔍 Checking problematic machines (that had 8 cassettes):');
const problematicMachines = [
  '74UEA43N03-070903',
  '74UEA43N03-070270',
  '74UEA43N03-070404',
  '74UEA43N03-069966'
];

for (const machineSN of problematicMachines) {
  if (machineGroups.has(machineSN)) {
    const records = machineGroups.get(machineSN)!;
    
    // Count cassettes
    let cassetteCount = 0;
    for (const record of records) {
      const mainCassette = record['SN Kaset'] || record['SN_Kaset'] || record['Cassette SN'];
      if (mainCassette && String(mainCassette).trim() !== '') {
        cassetteCount++;
      }
      
      const backupCassette = record['SN Kaset Cadangan'] || record['SN_Kaset_Cadangan'] || record['Backup Cassette SN'];
      if (backupCassette && String(backupCassette).trim() !== '') {
        cassetteCount++;
      }
    }
    
    const icon = cassetteCount === 10 ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${machineSN}: ${records.length} rows, ${cassetteCount} cassettes`);
  } else {
    console.log(`  ❌ ${machineSN}: NOT FOUND in Excel`);
  }
}

