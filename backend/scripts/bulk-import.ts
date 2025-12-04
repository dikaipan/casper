import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BankData {
  bankCode: string;
  bankName: string;
  branchCode?: string;
  address?: string;
  city?: string;
  province?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

interface CassetteData {
  serialNumber: string;
  cassetteTypeCode: string; // RB, AB, URJB
  customerBankCode: string; // Bank code, not ID
  purchaseDate?: string; // YYYY-MM-DD
  warrantyExpiryDate?: string; // YYYY-MM-DD
  status?: 'OK' | 'BAD' | 'IN_TRANSIT_TO_RC' | 'IN_REPAIR' | 'IN_TRANSIT_TO_VENDOR' | 'SCRAPPED';
  notes?: string;
}

interface ImportData {
  banks?: BankData[];
  cassettes?: CassetteData[];
}

async function importBanks(banks: BankData[]) {
  console.log(`\n🏦 Importing ${banks.length} banks...`);
  const results: Array<{ success: boolean; bankCode: string; bankName?: string; error?: any }> = [];

  for (const bankData of banks) {
    try {
      const bank = await prisma.customerBank.upsert({
        where: { bankCode: bankData.bankCode },
        update: {
          bankName: bankData.bankName,
          primaryContactName: bankData.contactPerson,
          primaryContactPhone: bankData.contactPhone,
          primaryContactEmail: bankData.contactEmail,
        },
        create: {
          bankCode: bankData.bankCode,
          bankName: bankData.bankName,
          primaryContactName: bankData.contactPerson,
          primaryContactPhone: bankData.contactPhone,
          primaryContactEmail: bankData.contactEmail,
          status: 'ACTIVE',
        },
      });

      results.push({ success: true, bankCode: bank.bankCode, bankName: bank.bankName });
      console.log(`  ✅ ${bank.bankCode} - ${bank.bankName}`);
    } catch (error) {
      results.push({ success: false, bankCode: bankData.bankCode, error: error.message });
      console.error(`  ❌ ${bankData.bankCode} - Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Banks imported: ${results.filter(r => r.success).length}/${banks.length}`);
  return results;
}

async function importCassettes(cassettes: CassetteData[]) {
  console.log(`\n📦 Importing ${cassettes.length} cassettes...`);
  const results: Array<{ success: boolean; serialNumber: string; error?: any }> = [];

  for (const cassetteData of cassettes) {
    try {
      // Get cassette type
      const cassetteType = await prisma.cassetteType.findUnique({
        where: { typeCode: cassetteData.cassetteTypeCode as any },
      });

      if (!cassetteType) {
        throw new Error(`Cassette type ${cassetteData.cassetteTypeCode} not found`);
      }

      // Get customer bank
      const bank = await prisma.customerBank.findUnique({
        where: { bankCode: cassetteData.customerBankCode },
      });

      if (!bank) {
        throw new Error(`Bank ${cassetteData.customerBankCode} not found`);
      }

      const cassette = await prisma.cassette.upsert({
        where: { serialNumber: cassetteData.serialNumber },
        update: {
          cassetteTypeId: cassetteType.id,
          customerBankId: bank.id,
          status: (cassetteData.status || 'OK') as any,
          notes: cassetteData.notes,
        },
        create: {
          serialNumber: cassetteData.serialNumber,
          cassetteTypeId: cassetteType.id,
          customerBankId: bank.id,
          status: (cassetteData.status || 'OK') as any,
          notes: cassetteData.notes,
        },
      });

      results.push({ success: true, serialNumber: cassette.serialNumber });
      console.log(`  ✅ ${cassette.serialNumber} - ${cassetteType.machineType} - ${bank.bankName}`);
    } catch (error) {
      results.push({ success: false, serialNumber: cassetteData.serialNumber, error: error.message });
      console.error(`  ❌ ${cassetteData.serialNumber} - Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Cassettes imported: ${results.filter(r => r.success).length}/${cassettes.length}`);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, '..', 'data', 'import-data.json');

  console.log('🚀 Starting bulk import...');
  console.log(`📁 Reading data from: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('\n💡 Please create a JSON file with the following structure:');
    console.log(`
{
  "banks": [
    {
      "bankCode": "BNI001",
      "bankName": "Bank BNI",
      "branchCode": "BNI-JKT-001",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "address": "Jl. Sudirman No. 1",
      "contactPerson": "John Doe",
      "contactPhone": "021-12345678",
      "contactEmail": "contact@bni.co.id"
    }
  ],
  "cassettes": [
    {
      "serialNumber": "RB-BNI-0001",
      "cassetteTypeCode": "RB",
      "customerBankCode": "BNI001",
      "status": "OK",
      "purchaseDate": "2024-01-01",
      "warrantyExpiryDate": "2026-01-01"
    }
  ]
}
    `);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const importData: ImportData = JSON.parse(fileContent);

  try {
    if (importData.banks && importData.banks.length > 0) {
      await importBanks(importData.banks);
    }

    if (importData.cassettes && importData.cassettes.length > 0) {
      await importCassettes(importData.cassettes);
    }

    console.log('\n✅ Bulk import completed!');
  } catch (error) {
    console.error('\n❌ Error during bulk import:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

