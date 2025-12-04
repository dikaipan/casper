import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MachineCassetteJsonEntry {
  machineSerialNumber: string;
  mainCassettes: string[];
  backupCassettes: string[];
}

async function main() {
  console.log('🔵 [export-mytable-to-json] Reading data from mytable...');

  // Ambil semua baris dari tabel sementara mytable yang sudah diisi dari improt.sql
  const rows = await prisma.$queryRawUnsafe<{
    id: number;
    snMesin: string | null;
    snKaset: string | null;
    snKasetCadangan: string | null;
  }[]>(
    'SELECT id, "SN Mesin" AS "snMesin", "SN Kaset" AS "snKaset", "SN Kaset Cadangan" AS "snKasetCadangan" FROM mytable ORDER BY "SN Mesin", id',
  );

  console.log(`🔵 [export-mytable-to-json] Loaded ${rows.length} rows from mytable`);

  if (rows.length === 0) {
    console.warn('⚠️ [export-mytable-to-json] mytable is empty. Nothing to export.');
    return;
  }

  // Group per SN Mesin
  const grouped = new Map<string, { main: string[]; backup: string[] }>();

  for (const row of rows) {
    const machineSN = (row.snMesin || '').trim();
    if (!machineSN) continue;

    const mainSN = (row.snKaset || '').trim();
    const backupSN = (row.snKasetCadangan || '').trim();

    if (!grouped.has(machineSN)) {
      grouped.set(machineSN, { main: [], backup: [] });
    }

    const group = grouped.get(machineSN)!;

    if (mainSN && !group.main.includes(mainSN)) {
      group.main.push(mainSN);
    }
    if (backupSN && !group.backup.includes(backupSN)) {
      group.backup.push(backupSN);
    }
  }

  const machines: MachineCassetteJsonEntry[] = [];

  for (const [machineSerialNumber, { main, backup }] of grouped.entries()) {
    machines.push({
      machineSerialNumber,
      mainCassettes: main,
      backupCassettes: backup,
    });
  }

  // Urutkan berdasarkan SN Mesin supaya rapi
  machines.sort((a, b) => a.machineSerialNumber.localeCompare(b.machineSerialNumber));

  const exportData = {
    machines,
  };

  const outputDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'machine-cassettes-from-mytable.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log('✅ [export-mytable-to-json] Export completed.');
  console.log(`   Machines: ${machines.length}`);
  console.log(`   Output file: ${outputPath}`);
}

main()
  .catch((e) => {
    console.error('❌ [export-mytable-to-json] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
