import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface ExcelRecord {
  'SN Mesin': string;
  'SN Kaset': string;
  'SN Kaset Cadangan': string;
  [key: string]: any;
}

async function verifyLinks(excelFilePath?: string) {
  try {
    console.log('🔍 Verifying Machine-Cassette Links...\n');

    // Determine Excel file path
    let excelFile = excelFilePath;
    if (!excelFile) {
      const possibleFiles = [
        path.join(__dirname, '../data/BNI_CASSETTE_COMPLETE.xlsx'),
        path.join(__dirname, '../data/BNI_CASSETTE_FIXED.xlsx'),
        path.join(__dirname, '../data/Progres APK SN kaset BNI 1600 mesin (1600) FIX (1).xlsx'),
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

    // Group records by machine SN (same logic as import script)
    const machineGroups = new Map<string, ExcelRecord[]>();
    let currentMachineSN = '';

    for (const record of records) {
      const machineSN = String(record['SN Mesin'] || record['SN_Mesin'] || record['SNMesin'] || '').trim();
      
      if (machineSN) {
        currentMachineSN = machineSN;
      }
      
      if (!currentMachineSN) continue;
      
      const mainCassette = String(record['SN Kaset'] || record['SN_Kaset'] || record['SNKaset'] || '').trim();
      const backupCassette = String(record['SN Kaset Cadangan'] || record['SN_Kaset_Cadangan'] || record['SNKasetCadangan'] || '').trim();
      
      if (!mainCassette && !backupCassette) continue;
      
      if (!record['SN Mesin']) {
        record['SN Mesin'] = currentMachineSN;
      }
      
      if (!machineGroups.has(currentMachineSN)) {
        machineGroups.set(currentMachineSN, []);
      }

      machineGroups.get(currentMachineSN)!.push(record);
    }

    console.log(`📊 Excel: ${machineGroups.size} machines found\n`);

    // Get all machines from database with their cassettes
    const machines = await prisma.machine.findMany({
      include: {
        cassettes: {
          select: {
            serialNumber: true,
            usageType: true,
          },
          orderBy: {
            serialNumber: 'asc',
          },
        },
      },
      orderBy: {
        serialNumberManufacturer: 'asc',
      },
    });

    console.log(`📊 Database: ${machines.length} machines found\n`);

    // Verify each machine
    let correctLinks = 0;
    let incorrectLinks = 0;
    const mismatches: Array<{
      machineSN: string;
      issue: string;
      excelCassettes: string[];
      dbCassettes: string[];
    }> = [];

    for (const [machineSN, excelRecords] of machineGroups.entries()) {
      const dbMachine = machines.find(m => m.serialNumberManufacturer === machineSN);
      
      if (!dbMachine) {
        mismatches.push({
          machineSN,
          issue: 'Machine not found in database',
          excelCassettes: [],
          dbCassettes: [],
        });
        incorrectLinks++;
        continue;
      }

      // Collect all cassette SNs from Excel for this machine
      const excelCassettes = new Set<string>();
      for (const record of excelRecords.slice(0, 5)) { // Only first 5 rows
        const main = String(record['SN Kaset'] || '').trim();
        const backup = String(record['SN Kaset Cadangan'] || '').trim();
        if (main) excelCassettes.add(main);
        if (backup) excelCassettes.add(backup);
      }

      // Collect all cassette SNs from database for this machine
      const dbCassettes = new Set(dbMachine.cassettes.map(c => c.serialNumber));

      // Check if all Excel cassettes are in database
      const missingInDB = Array.from(excelCassettes).filter(sn => !dbCassettes.has(sn));
      const extraInDB = Array.from(dbCassettes).filter(sn => !excelCassettes.has(sn));

      if (missingInDB.length === 0 && extraInDB.length === 0) {
        correctLinks++;
      } else {
        incorrectLinks++;
        mismatches.push({
          machineSN,
          issue: missingInDB.length > 0 
            ? `Missing ${missingInDB.length} cassettes in database`
            : `Extra ${extraInDB.length} cassettes in database`,
          excelCassettes: Array.from(excelCassettes).sort(),
          dbCassettes: Array.from(dbCassettes).sort(),
        });
      }
    }

    // Summary
    console.log('📊 Verification Summary:\n');
    console.log(`   ✅ Correct links: ${correctLinks}`);
    console.log(`   ❌ Incorrect links: ${incorrectLinks}`);
    console.log(`   📊 Total verified: ${machineGroups.size}\n`);

    if (mismatches.length > 0) {
      console.log('⚠️  Machines with mismatched cassettes:\n');
      mismatches.slice(0, 10).forEach(mismatch => {
        console.log(`   ${mismatch.machineSN}: ${mismatch.issue}`);
        if (mismatch.excelCassettes.length > 0) {
          console.log(`      Excel cassettes (${mismatch.excelCassettes.length}): ${mismatch.excelCassettes.slice(0, 5).join(', ')}${mismatch.excelCassettes.length > 5 ? '...' : ''}`);
        }
        if (mismatch.dbCassettes.length > 0) {
          console.log(`      DB cassettes (${mismatch.dbCassettes.length}): ${mismatch.dbCassettes.slice(0, 5).join(', ')}${mismatch.dbCassettes.length > 5 ? '...' : ''}`);
        }
        console.log('');
      });
      if (mismatches.length > 10) {
        console.log(`   ... and ${mismatches.length - 10} more\n`);
      }
    } else {
      console.log('✅ All machine-cassette links are correct! No cassettes are mixed up.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error during verification:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const excelFilePath = args[0]; // Optional: path to Excel file

  try {
    await verifyLinks(excelFilePath);
  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

