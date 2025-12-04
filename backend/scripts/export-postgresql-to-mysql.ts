import { PrismaClient as PrismaMySQL } from '@prisma/client';
import { Client as PgClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection (from old DATABASE_URL or new env var)
const postgresUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL_OLD || '';
// MySQL connection (current DATABASE_URL)
const mysqlPrisma = new PrismaMySQL();

interface MachineData {
  id: string;
  customerBankId: string;
  pengelolaId: string;
  machineCode: string;
  modelName: string;
  serialNumberManufacturer: string;
  physicalLocation: string;
  branchCode: string;
  city: string;
  province: string;
  installationDate: Date | null;
  currentWsid: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CassetteData {
  id: string;
  serialNumber: string;
  cassetteTypeId: string;
  customerBankId: string;
  machineId: string | null;
  usageType: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function exportFromPostgreSQL() {
  if (!postgresUrl || !postgresUrl.includes('postgres')) {
    console.error('❌ Error: POSTGRES_DATABASE_URL not found or invalid');
    console.error('   Please set POSTGRES_DATABASE_URL in .env file');
    console.error('   Example: POSTGRES_DATABASE_URL=postgresql://user:password@localhost:5432/dbname');
    process.exit(1);
  }

  const pgClient = new PgClient({ connectionString: postgresUrl });

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Export Machines
    console.log('📦 Exporting machines...');
    const machinesResult = await pgClient.query(`
      SELECT 
        id, customer_bank_id as "customerBankId", pengelola_id as "pengelolaId",
        machine_code as "machineCode", model_name as "modelName",
        serial_number_manufacturer as "serialNumberManufacturer",
        physical_location as "physicalLocation", branch_code as "branchCode",
        city, province, installation_date as "installationDate",
        current_wsid as "currentWsid", status, notes,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM machines
      ORDER BY created_at
    `);
    const machines: MachineData[] = machinesResult.rows;
    console.log(`   ✅ Exported ${machines.length} machines\n`);

    // Export Cassettes
    console.log('📦 Exporting cassettes...');
    const cassettesResult = await pgClient.query(`
      SELECT 
        id, serial_number as "serialNumber", cassette_type_id as "cassetteTypeId",
        customer_bank_id as "customerBankId", machine_id as "machineId",
        usage_type as "usageType", status, notes,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM cassettes
      ORDER BY created_at
    `);
    const cassettes: CassetteData[] = cassettesResult.rows;
    console.log(`   ✅ Exported ${cassettes.length} cassettes\n`);

    await pgClient.end();

    return { machines, cassettes };
  } catch (error: any) {
    console.error('❌ Error exporting from PostgreSQL:', error.message);
    await pgClient.end();
    throw error;
  }
}

async function importToMySQL(data: { machines: MachineData[]; cassettes: CassetteData[] }) {
  console.log('🔄 Importing to MySQL...\n');

  let machineCount = 0;
  let cassetteCount = 0;
  const errors: string[] = [];

  // Import Machines
  console.log('📦 Importing machines...');
  for (const machine of data.machines) {
    try {
      // Check if machine already exists
      const existing = await mysqlPrisma.machine.findUnique({
        where: { id: machine.id },
      });

      if (existing) {
        // Update existing
        await mysqlPrisma.machine.update({
          where: { id: machine.id },
          data: {
            customerBankId: machine.customerBankId,
            pengelolaId: machine.pengelolaId,
            machineCode: machine.machineCode,
            modelName: machine.modelName,
            serialNumberManufacturer: machine.serialNumberManufacturer,
            physicalLocation: machine.physicalLocation,
            branchCode: machine.branchCode,
            city: machine.city,
            province: machine.province,
            installationDate: machine.installationDate,
            currentWsid: machine.currentWsid,
            status: machine.status as any,
            notes: machine.notes,
          },
        });
        machineCount++;
        if (machineCount % 50 === 0) {
          console.log(`   ✅ Imported ${machineCount}/${data.machines.length} machines...`);
        }
      } else {
        // Create new
        await mysqlPrisma.machine.create({
          data: {
            id: machine.id,
            customerBankId: machine.customerBankId,
            pengelolaId: machine.pengelolaId,
            machineCode: machine.machineCode,
            modelName: machine.modelName,
            serialNumberManufacturer: machine.serialNumberManufacturer,
            physicalLocation: machine.physicalLocation,
            branchCode: machine.branchCode,
            city: machine.city,
            province: machine.province,
            installationDate: machine.installationDate,
            currentWsid: machine.currentWsid,
            status: machine.status as any,
            notes: machine.notes,
          },
        });
        machineCount++;
        if (machineCount % 50 === 0) {
          console.log(`   ✅ Imported ${machineCount}/${data.machines.length} machines...`);
        }
      }
    } catch (error: any) {
      const errorMsg = `Failed to import machine ${machine.machineCode}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }
  }
  console.log(`   ✅ Machines: ${machineCount}/${data.machines.length} imported\n`);

  // Import Cassettes
  console.log('📦 Importing cassettes...');
  for (const cassette of data.cassettes) {
    try {
      // Check if cassette already exists
      const existing = await mysqlPrisma.cassette.findUnique({
        where: { id: cassette.id },
      });

      if (existing) {
        // Update existing
        await mysqlPrisma.cassette.update({
          where: { id: cassette.id },
          data: {
            serialNumber: cassette.serialNumber,
            cassetteTypeId: cassette.cassetteTypeId,
            customerBankId: cassette.customerBankId,
            machineId: cassette.machineId,
            usageType: cassette.usageType as any,
            status: cassette.status as any,
            notes: cassette.notes,
          },
        });
        cassetteCount++;
        if (cassetteCount % 100 === 0) {
          console.log(`   ✅ Imported ${cassetteCount}/${data.cassettes.length} cassettes...`);
        }
      } else {
        // Create new
        await mysqlPrisma.cassette.create({
          data: {
            id: cassette.id,
            serialNumber: cassette.serialNumber,
            cassetteTypeId: cassette.cassetteTypeId,
            customerBankId: cassette.customerBankId,
            machineId: cassette.machineId,
            usageType: cassette.usageType as any,
            status: cassette.status as any,
            notes: cassette.notes,
          },
        });
        cassetteCount++;
        if (cassetteCount % 100 === 0) {
          console.log(`   ✅ Imported ${cassetteCount}/${data.cassettes.length} cassettes...`);
        }
      }
    } catch (error: any) {
      const errorMsg = `Failed to import cassette ${cassette.serialNumber}: ${error.message}`;
      errors.push(errorMsg);
      console.error(`   ❌ ${errorMsg}`);
    }
  }
  console.log(`   ✅ Cassettes: ${cassetteCount}/${data.cassettes.length} imported\n`);

  if (errors.length > 0) {
    console.log('⚠️  Errors encountered:');
    errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
    console.log('');
  }

  return { machineCount, cassetteCount, errors };
}

async function main() {
  console.log('🚀 PostgreSQL to MySQL Migration Tool');
  console.log('=====================================\n');

  try {
    // Export from PostgreSQL
    const data = await exportFromPostgreSQL();

    // Import to MySQL
    const result = await importToMySQL(data);

    console.log('📊 Migration Summary:');
    console.log(`   Machines: ${result.machineCount}/${data.machines.length}`);
    console.log(`   Cassettes: ${result.cassetteCount}/${data.cassettes.length}`);
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
    }
    console.log('\n✅ Migration completed!');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mysqlPrisma.$disconnect();
  }
}

main();

