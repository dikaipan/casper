import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

interface ExcelRecord {
  'SN Mesin': string;
  'SN Kaset': string;
  'SN Kaset Cadangan': string;
  'Tipe Kaset': string;
  [key: string]: any;
}

async function analyzeMachineDetails(excelFilePath: string, machineSNs?: string[]) {
  try {
    console.log('🔍 Detailed Machine Analysis\n');
    console.log(`📄 Reading Excel file: ${excelFilePath}\n`);

    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    // Read Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('mesin') || 
      name.toLowerCase().includes('machine') ||
      name.toLowerCase().includes('data')
    ) || workbook.SheetNames[0];
    
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as ExcelRecord[];

    console.log(`📊 Parsed ${records.length} records from Excel sheet: "${sheetName}"\n`);

    // Group records by machine SN
    const machineGroups = new Map<string, ExcelRecord[]>();

    for (const record of records) {
      const machineSN = String(record['SN Mesin'] || '').trim();
      if (!machineSN) continue;

      if (!machineGroups.has(machineSN)) {
        machineGroups.set(machineSN, []);
      }

      machineGroups.get(machineSN)!.push(record);
    }

    // Filter machines if specific SNs provided
    let machinesToAnalyze = Array.from(machineGroups.entries());
    if (machineSNs && machineSNs.length > 0) {
      machinesToAnalyze = machinesToAnalyze.filter(([sn]) => machineSNs.includes(sn));
    }

    // Analyze each machine
    const machinesWith12: Array<{ machineSN: string; rows: ExcelRecord[] }> = [];
    const machinesWith8: Array<{ machineSN: string; rows: ExcelRecord[] }> = [];

    for (const [machineSN, records] of machinesToAnalyze) {
      let mainCassettes = 0;
      let backupCassettes = 0;

      for (const record of records) {
        if (String(record['SN Kaset'] || '').trim()) mainCassettes++;
        if (String(record['SN Kaset Cadangan'] || '').trim()) backupCassettes++;
      }

      const totalCassettes = mainCassettes + backupCassettes;

      if (totalCassettes === 12) {
        machinesWith12.push({ machineSN, rows: records });
      } else if (totalCassettes === 8) {
        machinesWith8.push({ machineSN, rows: records });
      }
    }

    // Display machines with 12 cassettes
    if (machinesWith12.length > 0) {
      console.log(`⚠️  Machines with 12 cassettes (${machinesWith12.length}):\n`);
      
      for (const { machineSN, rows } of machinesWith12) {
        console.log(`📦 ${machineSN} (${rows.length} rows, 12 cassettes):`);
        console.log('   Row | SN Kaset (MAIN)        | SN Kaset Cadangan (BACKUP)');
        console.log('   ----|------------------------|---------------------------');
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const mainSN = String(row['SN Kaset'] || '').trim();
          const backupSN = String(row['SN Kaset Cadangan'] || '').trim();
          const type = String(row['Tipe Kaset'] || '').trim();
          
          const mainDisplay = mainSN || '(empty)';
          const backupDisplay = backupSN || '(empty)';
          const typeDisplay = type || 'N/A';
          
          console.log(`   ${String(i + 1).padStart(3)} | ${mainDisplay.padEnd(22)} | ${backupDisplay.padEnd(25)} [${typeDisplay}]`);
        }
        
        console.log(`\n   💡 Recommendation: Keep first 5 rows (10 cassettes), ignore rows 6+ (2 extra cassettes)`);
        console.log('');
      }
    }

    // Display machines with 8 cassettes
    if (machinesWith8.length > 0) {
      console.log(`⚠️  Machines with 8 cassettes (${machinesWith8.length}):\n`);
      
      for (const { machineSN, rows } of machinesWith8) {
        console.log(`📦 ${machineSN} (${rows.length} rows, 8 cassettes):`);
        console.log('   Row | SN Kaset (MAIN)        | SN Kaset Cadangan (BACKUP)');
        console.log('   ----|------------------------|---------------------------');
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const mainSN = String(row['SN Kaset'] || '').trim();
          const backupSN = String(row['SN Kaset Cadangan'] || '').trim();
          const type = String(row['Tipe Kaset'] || '').trim();
          
          const mainDisplay = mainSN || '(empty)';
          const backupDisplay = backupSN || '(empty)';
          const typeDisplay = type || 'N/A';
          
          console.log(`   ${String(i + 1).padStart(3)} | ${mainDisplay.padEnd(22)} | ${backupDisplay.padEnd(25)} [${typeDisplay}]`);
        }
        
        console.log(`\n   ⚠️  Missing: 2 cassettes (should have 5 rows = 10 cassettes, but only has ${rows.length} rows)`);
        console.log('');
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Machines with 12 cassettes: ${machinesWith12.length}`);
    console.log(`   - Machines with 8 cassettes: ${machinesWith8.length}`);
    console.log(`   - Total machines analyzed: ${machinesToAnalyze.length}`);

  } catch (error: any) {
    console.error('\n❌ Error during analysis:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const excelFilePath = args[0] || path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx');
  const machineSNs = args.slice(1); // Optional: specific machine SNs to analyze

  try {
    await analyzeMachineDetails(excelFilePath, machineSNs.length > 0 ? machineSNs : undefined);
  } catch (error: any) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

main();

