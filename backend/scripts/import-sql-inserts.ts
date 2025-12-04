import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MachineInsert {
  serialNumberManufacturer: string;
  machineCode?: string;
  modelName?: string;
  customerBankId?: string;
  vendorId?: string;
  physicalLocation?: string;
  [key: string]: any;
}

interface CassetteInsert {
  serialNumber: string;
  cassetteTypeId?: string;
  customerBankId?: string;
  machineId?: string;
  usageType?: string;
  [key: string]: any;
}

async function parseSQLInserts(filePath: string) {
  console.log('🔄 Reading SQL file:', filePath);
  
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  const lines = sqlContent.split('\n');

  const machines: MachineInsert[] = [];
  const cassettes: CassetteInsert[] = [];

  let currentTable = '';
  let currentInsert = '';

  for (let line of lines) {
    line = line.trim();
    
    // Skip comments and empty lines
    if (!line || line.startsWith('--') || line.startsWith('/*')) {
      continue;
    }

    // Detect table name from INSERT INTO
    const insertMatch = line.match(/INSERT INTO\s+["`]?(\w+)["`]?\s+/i);
    if (insertMatch) {
      currentTable = insertMatch[1].toLowerCase();
      currentInsert = line;
      continue;
    }

    // Accumulate multi-line INSERT
    if (currentInsert) {
      currentInsert += ' ' + line;
      
      // Check if INSERT is complete (ends with semicolon)
      if (line.endsWith(';')) {
        // Parse the complete INSERT statement
        if (currentTable === 'machines') {
          const parsed = parseInsertStatement(currentInsert);
          machines.push(...parsed);
        } else if (currentTable === 'cassettes') {
          const parsed = parseInsertStatement(currentInsert);
          cassettes.push(...parsed);
        }
        
        currentInsert = '';
        currentTable = '';
      }
    }
  }

  console.log(`\n📊 Parsed from SQL:`);
  console.log(`  • Machines: ${machines.length}`);
  console.log(`  • Cassettes: ${cassettes.length}`);

  return { machines, cassettes };
}

function parseInsertStatement(sql: string): any[] {
  // This is a simplified parser
  // For complex SQL, consider using a proper SQL parser library
  const results: any[] = [];
  
  // Extract column names
  const columnsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
  if (!columnsMatch) return results;
  
  const columns = columnsMatch[1].split(',').map(c => c.trim().replace(/["`]/g, ''));
  
  // Extract values
  const valuesMatch = sql.match(/VALUES\s+(.+);/is);
  if (!valuesMatch) return results;
  
  const valuesStr = valuesMatch[1];
  
  // Split by rows (rows are separated by ),(
  const rows = valuesStr.split(/\),\s*\(/);
  
  for (let row of rows) {
    row = row.replace(/^\(/, '').replace(/\)$/, '');
    
    // Parse values (handle quotes and escapes)
    const values = parseValues(row);
    
    const record: any = {};
    columns.forEach((col, idx) => {
      record[col] = values[idx];
    });
    
    results.push(record);
  }
  
  return results;
}

function parseValues(row: string): any[] {
  const values: any[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (!inQuote) {
      if (char === "'" || char === '"') {
        inQuote = true;
        quoteChar = char;
      } else if (char === ',') {
        values.push(cleanValue(current));
        current = '';
      } else {
        current += char;
      }
    } else {
      if (char === quoteChar && row[i - 1] !== '\\') {
        inQuote = false;
        quoteChar = '';
      } else {
        current += char;
      }
    }
  }
  
  if (current) {
    values.push(cleanValue(current));
  }
  
  return values;
}

function cleanValue(val: string): any {
  val = val.trim();
  
  if (val === 'NULL' || val === 'null') return null;
  if (val === 'TRUE' || val === 'true') return true;
  if (val === 'FALSE' || val === 'false') return false;
  if (/^\d+$/.test(val)) return parseInt(val);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  
  // Remove quotes
  return val.replace(/^['"]/, '').replace(/['"]$/, '');
}

async function importData() {
  try {
    const sqlFile = process.argv[2];
    
    if (!sqlFile) {
      console.error('❌ Error: Please provide SQL file path');
      console.error('Usage: npm run import:sql path/to/file.sql');
      process.exit(1);
    }

    const filePath = path.isAbsolute(sqlFile) ? sqlFile : path.join(process.cwd(), sqlFile);
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Error: File not found:', filePath);
      process.exit(1);
    }

    const { machines, cassettes } = await parseSQLInserts(filePath);

    console.log('\n🔄 Importing to database...\n');

    // Import machines
    let machineCount = 0;
    for (const machine of machines) {
      try {
        await prisma.machine.create({
          data: machine as any,
        });
        machineCount++;
        if (machineCount % 100 === 0) {
          console.log(`  ✓ Imported ${machineCount}/${machines.length} machines...`);
        }
      } catch (error: any) {
        console.error(`  ✗ Failed to import machine ${machine.serialNumberManufacturer}:`, error.message);
      }
    }

    // Import cassettes
    let cassetteCount = 0;
    for (const cassette of cassettes) {
      try {
        await prisma.cassette.create({
          data: cassette as any,
        });
        cassetteCount++;
        if (cassetteCount % 100 === 0) {
          console.log(`  ✓ Imported ${cassetteCount}/${cassettes.length} cassettes...`);
        }
      } catch (error: any) {
        console.error(`  ✗ Failed to import cassette ${cassette.serialNumber}:`, error.message);
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`  • Machines: ${machineCount}/${machines.length}`);
    console.log(`  • Cassettes: ${cassetteCount}/${cassettes.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();

