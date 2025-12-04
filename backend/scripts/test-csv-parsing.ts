import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const csvFilePath = path.join(__dirname, '../data/BNI CASSETTE MONITORING .csv');

console.log('🔍 Reading CSV file:', csvFilePath);

// Read CSV file
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// Auto-detect delimiter (comma or semicolon)
const firstLine = csvContent.split('\n')[0];
const delimiter = firstLine.includes(';') ? ';' : ',';
console.log('🔍 Detected delimiter:', delimiter === ';' ? 'semicolon' : 'comma');
console.log('🔍 First line:', firstLine);

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
  relax_quotes: true,
  bom: true,
  delimiter: delimiter,
}) as any[];

console.log('\n📊 Total records:', records.length);
console.log('📋 Columns:', Object.keys(records[0] || {}));
console.log('\n🔍 First 3 records:');
records.slice(0, 3).forEach((record, i) => {
  console.log(`\nRecord ${i + 1}:`, JSON.stringify(record, null, 2));
});

// Group by machine
const machineGroups = new Map<string, any[]>();

for (const record of records) {
  const machineSN = record['SN Mesin']?.trim();
  if (!machineSN) continue;
  
  if (!machineGroups.has(machineSN)) {
    machineGroups.set(machineSN, []);
  }
  
  machineGroups.get(machineSN)!.push(record);
}

console.log('\n🖥️  Total unique machines:', machineGroups.size);

// Show cassette count distribution
const cassetteCountMap = new Map<number, number>();
for (const [_, records] of machineGroups.entries()) {
  // Each record has 2 cassettes (SN Kaset + SN Kaset Cadangan)
  const count = records.length * 2;
  cassetteCountMap.set(count, (cassetteCountMap.get(count) || 0) + 1);
}

console.log('\n📊 Cassette count per machine (assuming 2 cassettes per row):');
Array.from(cassetteCountMap.entries())
  .sort((a, b) => a[0] - b[0])
  .forEach(([count, machines]) => {
    const icon = count === 10 ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${count} cassettes: ${machines} machines`);
  });

// Show first few machines with their cassettes
console.log('\n🔍 First 3 machines with their records:');
let machineCount = 0;
for (const [machineSN, records] of machineGroups.entries()) {
  if (machineCount >= 3) break;
  
  console.log(`\n  Machine: ${machineSN}`);
  console.log(`  Records: ${records.length} rows (${records.length * 2} cassettes)`);
  records.forEach((rec, i) => {
    console.log(`    Row ${i + 1}: Kaset="${rec['SN Kaset']}", Cadangan="${rec['SN Kaset Cadangan']}", Tipe="${rec['Tipe Kaset']}"`);
  });
  
  machineCount++;
}

