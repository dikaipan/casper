import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SQLRecord {
  No: number;
  'SN Mesin': string;
  'SN Kaset': string;
  'Tipe Kaset': string;
  'utama/cadangan': string;
  'SO-ID': string;
  Status: string;
  'Tanggal request': string;
  'Tanggal kirim': string;
  'Tanggal perbaikan': string;
  'Hasil perbaikan': string;
  'Kategori Problem': string;
  Pengelola: string;
  Kota: string;
  'WSID Mesin': string;
}

async function parseMySQLDump(filePath: string): Promise<SQLRecord[]> {
  console.log('🔄 Reading MySQL dump file:', filePath);
  
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  const records: SQLRecord[] = [];
  const lines = sqlContent.split('\n');
  
  let inInsert = false;
  let rowCount = 0;
  let skippedCount = 0;
  let totalLinesChecked = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect start of INSERT statement
    if (trimmed.includes('INSERT INTO `bni_repair_cassette_monitoring_1_`')) {
      inInsert = true;
      console.log('  🔍 Found INSERT statement, starting parse...');
      continue;
    }
    
    // If we're in INSERT block, parse rows
    if (inInsert) {
      // Check if line starts with (
      if (trimmed.startsWith('(')) {
        totalLinesChecked++;
        const values = parseRowSimple(trimmed);
        
        if (!values || values.length < 15) {
          skippedCount++;
          if (skippedCount <= 5) {
            console.log(`  ⚠️  Skipped line (values.length=${values?.length}): ${trimmed.substring(0, 50)}...`);
          }
          continue;
        }
        
        // Skip header row (row 0)
        if (values[0] === '0' || values[1] === 'SN Mesin') {
          console.log(`  ⏭️  Skipping header row`);
          continue;
        }
        
        const machineSN = (values[1] || '').toString().trim();
        const cassetteSN = (values[2] || '').toString().trim();
        
        if (!machineSN || !cassetteSN) {
          skippedCount++;
          continue;
        }
        
        const record: SQLRecord = {
          No: parseInt(values[0] as string) || 0,
          'SN Mesin': machineSN,
          'SN Kaset': cassetteSN,
          'Tipe Kaset': (values[3] || '').toString().trim(),
          'utama/cadangan': (values[4] || '').toString().trim(),
          'SO-ID': (values[5] || '').toString().trim(),
          Status: (values[6] || '').toString().trim(),
          'Tanggal request': (values[7] || '').toString().trim(),
          'Tanggal kirim': (values[8] || '').toString().trim(),
          'Tanggal perbaikan': (values[9] || '').toString().trim(),
          'Hasil perbaikan': (values[10] || '').toString().trim(),
          'Kategori Problem': (values[11] || '').toString().trim(),
          Pengelola: (values[12] || '').toString().trim(),
          Kota: (values[13] || '').toString().trim(),
          'WSID Mesin': (values[14] || '').toString().trim(),
        };
        
        records.push(record);
        rowCount++;
        
        if (rowCount % 2000 === 0) {
          console.log(`  📊 Parsed ${rowCount} records (${totalLinesChecked} lines checked, ${skippedCount} skipped)...`);
        }
      }
      
      // Check if this is the last row (ends with ;)
      if (trimmed.endsWith(';')) {
        console.log(`  🏁 End of INSERT statement detected`);
        inInsert = false;
        break;
      }
    }
  }
  
  console.log(`  📊 Total parsed: ${rowCount} records from ${totalLinesChecked} lines (${skippedCount} skipped)`);
  
  return records;
}

function parseRowSimple(line: string): any[] {
  // Remove leading '(' and trailing '),' or ');'
  line = line.replace(/^\(/, '').replace(/\)[,;]\s*$/, '');
  
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === "'" && (i === 0 || line[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
      } else {
        inQuote = false;
        values.push(current);
        current = '';
        // Skip the comma after quote if exists
        if (nextChar === ',') {
          i++;
        }
      }
    } else if (char === ',' && !inQuote) {
      if (current === '' || current === ' ') {
        values.push('');
      } else {
        values.push(current.trim());
      }
      current = '';
    } else if (inQuote) {
      current += char;
    } else if (char !== ' ' || current.length > 0) {
      current += char;
    }
  }
  
  // Add last value
  if (current || values.length > 0) {
    values.push(current.trim());
  }
  
  return values;
}


async function importFromSQL(bankCode: string, pengelolaCode: string) {
  try {
    const sqlFile = path.join(__dirname, '../data/cassette_repair_db.sql');
    
    console.log('\n🔄 Starting import from MySQL dump...\n');
    
    // Parse SQL file
    const records = await parseMySQLDump(sqlFile);
    console.log(`📊 Parsed ${records.length} cassette records from SQL\n`);
    
    // Get bank and pengelola
    const bank = await prisma.customerBank.findUnique({
      where: { bankCode },
    });
    
    if (!bank) {
      throw new Error(`Bank not found: ${bankCode}`);
    }
    
    const pengelola = await prisma.pengelola.findUnique({
      where: { pengelolaCode },
    });
    
    if (!pengelola) {
      throw new Error(`pengelola not found: ${pengelolaCode}`);
    }
    
    console.log(`🏢 Bank: ${bank.bankName} (${bank.bankCode})`);
    console.log(`🚚 pengelola: ${pengelola.companyName} (${pengelola.pengelolaCode})\n`);
    
    // Get cassette types
    const cassetteTypes = await prisma.cassetteType.findMany();
    const typeMap = new Map(cassetteTypes.map(t => [t.typeCode, t]));
    
    console.log(`📦 Available cassette types: ${Array.from(typeMap.keys()).join(', ')}\n`);
    
    // Group records by machine
    const machineMap = new Map<string, SQLRecord[]>();
    
    for (const record of records) {
      const machineSN = record['SN Mesin'];
      if (!machineMap.has(machineSN)) {
        machineMap.set(machineSN, []);
      }
      machineMap.get(machineSN)!.push(record);
    }
    
    console.log(`🖥️  Unique machines found: ${machineMap.size}\n`);
    console.log('🔄 Importing machines and cassettes...\n');
    
    let machineCount = 0;
    let cassetteCount = 0;
    let skippedCassettes = 0;
    const errors: string[] = [];
    
    for (const [machineSN, cassettes] of machineMap.entries()) {
      try {
        // Check if machine already exists
        let machine = await prisma.machine.findFirst({
          where: { serialNumberManufacturer: machineSN },
        });
        
        if (!machine) {
          // Create machine
          machine = await prisma.machine.create({
            data: {
              serialNumberManufacturer: machineSN,
              machineCode: `MCH-${machineSN.slice(-6)}`,
              modelName: 'ATM Model', // Default, adjust if needed
              physicalLocation: cassettes[0].Kota || 'Unknown',
              customerBankId: bank.id,
              pengelolaId: pengelola.id,
              currentWsid: cassettes[0]['WSID Mesin'] || null,
              notes: `Imported from MySQL dump on ${new Date().toISOString()}`,
            },
          });
          machineCount++;
        }
        
        // Import cassettes for this machine
        for (const cassetteRecord of cassettes) {
          try {
            const cassetteSN = cassetteRecord['SN Kaset'];
            const cassetteTypeCode = cassetteRecord['Tipe Kaset'];
            const usageType = cassetteRecord['utama/cadangan'].toLowerCase().includes('utama') 
              ? 'MAIN' 
              : 'BACKUP';
            
            // Check if cassette already exists
            const existingCassette = await prisma.cassette.findUnique({
              where: { serialNumber: cassetteSN },
            });
            
            if (existingCassette) {
              skippedCassettes++;
              continue;
            }
            
            // Get cassette type
            const cassetteType = typeMap.get(cassetteTypeCode as any);
            if (!cassetteType) {
              errors.push(`Unknown cassette type: ${cassetteTypeCode} for ${cassetteSN}`);
              skippedCassettes++;
              continue;
            }
            
            // Create cassette
            await prisma.cassette.create({
              data: {
                serialNumber: cassetteSN,
                cassetteTypeId: cassetteType.id,
                customerBankId: bank.id,
                machineId: machine.id,
                usageType: usageType as any,
                status: 'OK',
                notes: `${usageType} cassette for machine ${machineSN}`,
              },
            });
            
            cassetteCount++;
          } catch (error: any) {
            errors.push(`Failed to import cassette ${cassetteRecord['SN Kaset']}: ${error.message}`);
            skippedCassettes++;
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
    
    // Show cassette count per machine
    console.log('\n📊 Cassette count validation:');
    
    const allMachines = await prisma.machine.findMany({
      where: {
        customerBankId: bank.id,
      },
      include: {
        cassettes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    
    console.log('\nSample machines (first 10):');
    allMachines.forEach(m => {
      const count = m.cassettes.length;
      const icon = count === 10 ? '✅' : '⚠️ ';
      console.log(`  ${icon} ${m.serialNumberManufacturer}: ${count} cassettes`);
    });
    
  } catch (error: any) {
    console.error('\n❌ Error during import:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get bank and pengelola codes from command line
const bankCode = process.argv[2] || 'BNI001';
const pengelolaCode = process.argv[3] || 'VND-TAG-001';

console.log('🚀 MySQL Import Script');
console.log('=======================');
console.log(`Bank Code: ${bankCode}`);
console.log(`pengelola Code: ${pengelolaCode}`);

importFromSQL(bankCode, pengelolaCode);

