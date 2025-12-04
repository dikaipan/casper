import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const excelFilePath = path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx');
const outputFilePath = path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx');

console.log('🔧 Fixing Excel data...\n');
console.log('📄 Input:', excelFilePath);
console.log('📄 Output:', outputFilePath);

// Read Excel file
const workbook = XLSX.readFile(excelFilePath);
const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('mesin')) || workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

console.log(`\n📊 Total records: ${data.length}`);

// Group by machine
const machineGroups = new Map<string, any[]>();
for (const record of data) {
  const machineSN = String(record['SN Mesin'] || '').trim();
  if (!machineSN) continue;
  
  if (!machineGroups.has(machineSN)) {
    machineGroups.set(machineSN, []);
  }
  machineGroups.get(machineSN)!.push(record);
}

console.log(`🖥️  Total machines: ${machineGroups.size}\n`);

// Machines with problems
const machinesWith12 = [
  '74UEA43N03-070360',
  '74UEA43N03-070409',
  '74UEA43N03-070299',
  '74UEA43N03-070931'
];

const machinesWith8 = [
  '74UEA43N03-069966',
  '74UEA43N03-070404',
  '74UEA43N03-070270',
  '74UEA43N03-070903'
];

console.log('🔧 Fixing machines with 12 cassettes (6 rows → 5 rows)...');
for (const machineSN of machinesWith12) {
  if (machineGroups.has(machineSN)) {
    const records = machineGroups.get(machineSN)!;
    console.log(`  • ${machineSN}: ${records.length} rows`);
    
    // Strategy: Keep first 5 rows (10 cassettes)
    // Row 6 usually has duplicate cassettes
    const fixedRecords = records.slice(0, 5);
    
    console.log(`    ✓ Keeping first 5 rows (10 cassettes)`);
    console.log(`    ✗ Removed row 6: Kaset="${records[5]?.['SN Kaset']}", Cadangan="${records[5]?.['SN Kaset Cadangan']}"`);
    
    machineGroups.set(machineSN, fixedRecords);
  }
}

console.log('\n⚠️  Machines with 8 cassettes (4 rows) - CANNOT AUTO-FIX:');
console.log('    These machines need 1 more row (2 more cassettes) to be added manually.');
for (const machineSN of machinesWith8) {
  if (machineGroups.has(machineSN)) {
    const records = machineGroups.get(machineSN)!;
    console.log(`  • ${machineSN}: ${records.length} rows (needs 1 more row)`);
  }
}

console.log('\n📝 Generating fixed data...');

// Convert back to flat array
const fixedData: any[] = [];
let rowNumber = 1;

for (const [machineSN, records] of machineGroups.entries()) {
  for (const record of records) {
    fixedData.push({
      'No': rowNumber++,
      'SN Mesin': record['SN Mesin'],
      'SN Kaset': record['SN Kaset'],
      'Tipe Kaset': record['Tipe Kaset'],
      'SN Kaset Cadangan': record['SN Kaset Cadangan'],
      'Tipe Kaset_1': record['Tipe Kaset_1'] || record['Tipe Kaset'],
      'SO-ID ': record['SO-ID '] || '',
      'Status ': record['Status '] || '',
      'Tanggal kirim ': record['Tanggal kirim '] || '',
      'Tanggal perbaikan ': record['Tanggal perbaikan '] || '',
      'Hasil perbaikan ': record['Hasil perbaikan '] || '',
      'Kategori Problem ': record['Kategori Problem '] || '',
    });
  }
}

console.log(`✅ Fixed data: ${fixedData.length} records`);

// Count cassettes
let totalCassettes = 0;
let machinesWithExactly10 = 0;

for (const [_, records] of machineGroups.entries()) {
  let cassetteCount = 0;
  for (const record of records) {
    if (String(record['SN Kaset'] || '').trim()) cassetteCount++;
    if (String(record['SN Kaset Cadangan'] || '').trim()) cassetteCount++;
  }
  totalCassettes += cassetteCount;
  if (cassetteCount === 10) machinesWithExactly10++;
}

console.log(`\n📊 Summary:`);
console.log(`   Total machines: ${machineGroups.size}`);
console.log(`   Total cassettes: ${totalCassettes}`);
console.log(`   Machines with exactly 10 cassettes: ${machinesWithExactly10}`);
console.log(`   Expected cassettes: ${machineGroups.size * 10} (${(machineGroups.size * 10) - totalCassettes} missing)`);

// Create new workbook
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.json_to_sheet(fixedData);
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Mesin');

// Write to file
XLSX.writeFile(newWorkbook, outputFilePath);

console.log(`\n✅ Fixed Excel file saved to: ${outputFilePath}`);

// Also create CSV version
const csvFilePath = path.join(__dirname, '../data/BNI_CASSETTE_FIXED.csv');
const csvContent = fixedData.map(row => 
  `${row['No']};${row['SN Mesin']};${row['SN Kaset']};${row['Tipe Kaset']};${row['SN Kaset Cadangan']};${row['Tipe Kaset_1']};${row['SO-ID ']};${row['Status ']};${row['Tanggal kirim ']};${row['Tanggal perbaikan ']};${row['Hasil perbaikan ']};${row['Kategori Problem ']}`
).join('\n');

const csvHeader = 'No;SN Mesin;SN Kaset;Tipe Kaset;SN Kaset Cadangan;Tipe Kaset_1;SO-ID ;Status ;Tanggal kirim ;Tanggal perbaikan ;Hasil perbaikan ;Kategori Problem \n';
fs.writeFileSync(csvFilePath, csvHeader + csvContent, 'utf-8');

console.log(`✅ Fixed CSV file saved to: ${csvFilePath}`);

console.log('\n⚠️  IMPORTANT NOTE:');
console.log('   4 machines still have only 8 cassettes (need 2 more each).');
console.log('   You need to manually add missing cassette data for these machines:');
machinesWith8.forEach(sn => console.log(`   - ${sn}`));

