import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface ExcelRecord {
  'SN Mesin': string;
  'SN Kaset': string;
  'SN Kaset Cadangan': string;
  'Tipe Kaset': string;
  [key: string]: any;
}

interface MachineAnalysis {
  machineSN: string;
  totalRows: number;
  mainCassettes: number;
  backupCassettes: number;
  totalCassettes: number;
  missingCount: number;
  rows: ExcelRecord[];
}

async function analyzeExcelFile(excelFilePath?: string) {
  try {
    console.log('🔍 Analyzing Excel file for cassette count issues...\n');

    // Determine Excel file path
    let excelFile = excelFilePath;
    if (!excelFile) {
      const possibleFiles = [
        path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx'),
        path.join(__dirname, '../data/BNI_CASSETTE_COMPLETE.xlsx'),
        path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx'),
      ];

      for (const file of possibleFiles) {
        if (fs.existsSync(file)) {
          excelFile = file;
          break;
        }
      }
    }

    if (!excelFile || !fs.existsSync(excelFile)) {
      throw new Error(`Excel file not found. Please provide path to Excel file.`);
    }

    console.log(`📄 Reading Excel file: ${excelFile}\n`);

    // Read Excel file
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('mesin') || 
      name.toLowerCase().includes('machine') ||
      name.toLowerCase().includes('data')
    ) || workbook.SheetNames[0];
    
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as ExcelRecord[];

    console.log(`📊 Parsed ${records.length} records from Excel sheet: "${sheetName}"\n`);

    // Group records by machine SN
    // Note: In some Excel files, SN Mesin is only filled in the first row of each machine group
    // We need to propagate the SN Mesin to subsequent rows
    const machineGroups = new Map<string, ExcelRecord[]>();
    let currentMachineSN = '';

    for (const record of records) {
      // Check if this row has SN Mesin
      const machineSN = String(record['SN Mesin'] || record['SN_Mesin'] || record['SNMesin'] || '').trim();
      
      if (machineSN) {
        // New machine found, update current
        currentMachineSN = machineSN;
      }
      
      // Skip if we don't have a current machine SN yet
      if (!currentMachineSN) continue;
      
      // Skip if this row doesn't have any cassette data
      const mainCassette = String(record['SN Kaset'] || record['SN_Kaset'] || record['SNKaset'] || '').trim();
      const backupCassette = String(record['SN Kaset Cadangan'] || record['SN_Kaset_Cadangan'] || record['SNKasetCadangan'] || '').trim();
      
      if (!mainCassette && !backupCassette) continue;
      
      // Add SN Mesin to record if it's missing (for grouping)
      if (!record['SN Mesin']) {
        record['SN Mesin'] = currentMachineSN;
      }
      
      if (!machineGroups.has(currentMachineSN)) {
        machineGroups.set(currentMachineSN, []);
      }

      machineGroups.get(currentMachineSN)!.push(record);
    }

    console.log(`🖥️  Unique machines found: ${machineGroups.size}\n`);

    // Analyze each machine
    const analyses: MachineAnalysis[] = [];
    const machinesWithIssues: MachineAnalysis[] = [];

    for (const [machineSN, records] of machineGroups.entries()) {
      let mainCassettes = 0;
      let backupCassettes = 0;

      for (const record of records) {
        if (String(record['SN Kaset'] || '').trim()) mainCassettes++;
        if (String(record['SN Kaset Cadangan'] || '').trim()) backupCassettes++;
      }

      const totalCassettes = mainCassettes + backupCassettes;
      const missingCount = 10 - totalCassettes;

      const analysis: MachineAnalysis = {
        machineSN,
        totalRows: records.length,
        mainCassettes,
        backupCassettes,
        totalCassettes,
        missingCount,
        rows: records,
      };

      analyses.push(analysis);

      if (totalCassettes !== 10) {
        machinesWithIssues.push(analysis);
      }
    }

    // Summary
    console.log('📊 Summary:');
    console.log(`   - Total machines: ${analyses.length}`);
    console.log(`   - Machines with exactly 10 cassettes: ${analyses.filter(a => a.totalCassettes === 10).length}`);
    console.log(`   - Machines with issues: ${machinesWithIssues.length}\n`);

    // Detailed analysis for machines with issues
    if (machinesWithIssues.length > 0) {
      console.log('⚠️  Machines with incorrect cassette count:\n');

      for (const analysis of machinesWithIssues) {
        const status = analysis.totalCassettes < 10 ? '⚠️  LESS' : '⚠️  MORE';
        console.log(`   ${status}: ${analysis.machineSN}`);
        console.log(`      - Total rows: ${analysis.totalRows}`);
        console.log(`      - MAIN cassettes: ${analysis.mainCassettes}`);
        console.log(`      - BACKUP cassettes: ${analysis.backupCassettes}`);
        console.log(`      - Total cassettes: ${analysis.totalCassettes} (expected 10)`);
        
        if (analysis.totalCassettes < 10) {
          console.log(`      - Missing: ${analysis.missingCount} cassettes`);
          
          // Check which rows are missing cassettes
          const rowsWithMissingMain: number[] = [];
          const rowsWithMissingBackup: number[] = [];
          
          for (let i = 0; i < Math.min(analysis.rows.length, 5); i++) {
            const row = analysis.rows[i];
            if (!String(row['SN Kaset'] || '').trim()) {
              rowsWithMissingMain.push(i + 1);
            }
            if (!String(row['SN Kaset Cadangan'] || '').trim()) {
              rowsWithMissingBackup.push(i + 1);
            }
          }
          
          if (rowsWithMissingMain.length > 0) {
            console.log(`      - Missing MAIN cassettes in rows: ${rowsWithMissingMain.join(', ')}`);
          }
          if (rowsWithMissingBackup.length > 0) {
            console.log(`      - Missing BACKUP cassettes in rows: ${rowsWithMissingBackup.join(', ')}`);
          }
        } else {
          console.log(`      - Extra: ${analysis.totalCassettes - 10} cassettes (will be ignored during import)`);
        }
        console.log('');
      }

      // Check database to see if these machines are already imported
      console.log('\n🔍 Checking database for these machines...\n');
      
      for (const analysis of machinesWithIssues) {
        const machine = await prisma.machine.findFirst({
          where: { serialNumberManufacturer: analysis.machineSN },
          include: {
            cassettes: {
              select: {
                serialNumber: true,
                usageType: true,
              },
            },
          },
        });

        if (machine) {
          console.log(`   ✅ ${analysis.machineSN}: Already in database`);
          console.log(`      - Database cassettes: ${machine.cassettes.length}`);
          console.log(`      - Excel cassettes: ${analysis.totalCassettes}`);
          
          if (machine.cassettes.length !== analysis.totalCassettes) {
            console.log(`      ⚠️  Mismatch! Database has ${machine.cassettes.length} cassettes, Excel has ${analysis.totalCassettes}`);
          }
        } else {
          console.log(`   ⏳ ${analysis.machineSN}: Not yet imported`);
        }
      }
    }

    // Statistics
    console.log('\n📈 Statistics:');
    const countDistribution = new Map<number, number>();
    analyses.forEach(a => {
      countDistribution.set(a.totalCassettes, (countDistribution.get(a.totalCassettes) || 0) + 1);
    });

    Array.from(countDistribution.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([count, machines]) => {
        const icon = count === 10 ? '✅' : '⚠️ ';
        console.log(`   ${icon} ${count} cassettes: ${machines} machines`);
      });

  } catch (error: any) {
    console.error('\n❌ Error during analysis:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const excelFilePath = args[0]; // Optional: path to Excel file

  try {
    await analyzeExcelFile(excelFilePath);
  } catch (error: any) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

