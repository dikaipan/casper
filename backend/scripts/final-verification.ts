import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function finalVerification() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    console.log('═'.repeat(70));
    console.log('🔍 FINAL DATABASE VERIFICATION');
    console.log('═'.repeat(70));
    
    // 1. Check total machines
    const machinesResult = await client.query('SELECT COUNT(*) as total FROM machines');
    const totalMachines = parseInt(machinesResult.rows[0].total);
    
    console.log('\n📊 MACHINES:');
    console.log(`   Total: ${totalMachines}`);
    console.log(`   Expected: 1600`);
    console.log(`   Status: ${totalMachines === 1600 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    // 2. Check total cassettes
    const cassettesResult = await client.query('SELECT COUNT(*) as total FROM cassettes');
    const totalCassettes = parseInt(cassettesResult.rows[0].total);
    
    console.log('\n📦 CASSETTES:');
    console.log(`   Total: ${totalCassettes}`);
    console.log(`   Expected: 16000`);
    console.log(`   Status: ${totalCassettes === 16000 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    // 3. Check cassette distribution
    const distributionQuery = `
      SELECT 
        COUNT(c.id) as cassette_count,
        COUNT(*) as machine_count
      FROM machines m
      LEFT JOIN cassettes c ON c.machine_id = m.id
      GROUP BY m.id
      ORDER BY cassette_count
    `;
    
    const distributionResult = await client.query(distributionQuery);
    const distribution = new Map<number, number>();
    
    for (const row of distributionResult.rows) {
      const count = parseInt(row.cassette_count);
      distribution.set(count, (distribution.get(count) || 0) + 1);
    }
    
    console.log('\n📈 CASSETTE DISTRIBUTION:');
    for (const [count, machines] of Array.from(distribution.entries()).sort((a, b) => a[0] - b[0])) {
      const icon = count === 10 ? '✅' : '⚠️';
      console.log(`   ${icon} ${count} cassettes: ${machines} machines`);
    }
    
    const allHave10 = distribution.size === 1 && distribution.has(10);
    console.log(`   Status: ${allHave10 ? '✅ ALL CORRECT (all machines have 10 cassettes)' : '❌ SOME INCORRECT'}`);
    
    // 4. Check usage type distribution
    const usageTypeQuery = `
      SELECT 
        usage_type,
        COUNT(*) as count
      FROM cassettes
      GROUP BY usage_type
      ORDER BY usage_type
    `;
    
    const usageTypeResult = await client.query(usageTypeQuery);
    
    console.log('\n🏷️  USAGE TYPE DISTRIBUTION:');
    let mainCount = 0;
    let backupCount = 0;
    
    for (const row of usageTypeResult.rows) {
      console.log(`   ${row.usage_type}: ${row.count}`);
      if (row.usage_type === 'MAIN') mainCount = parseInt(row.count);
      if (row.usage_type === 'BACKUP') backupCount = parseInt(row.count);
    }
    
    const expectedEach = 8000; // 1600 machines * 5 each
    console.log(`   Expected: MAIN=${expectedEach}, BACKUP=${expectedEach}`);
    console.log(`   Status: ${mainCount === expectedEach && backupCount === expectedEach ? '✅ CORRECT' : '⚠️ CHECK'}`);
    
    // 5. Check cassette types
    const cassetteTypeQuery = `
      SELECT 
        ct.type_code,
        COUNT(c.id) as count
      FROM cassettes c
      JOIN cassette_types ct ON c.cassette_type_id = ct.id
      GROUP BY ct.type_code
      ORDER BY ct.type_code
    `;
    
    const cassetteTypeResult = await client.query(cassetteTypeQuery);
    
    console.log('\n📦 CASSETTE TYPE DISTRIBUTION:');
    for (const row of cassetteTypeResult.rows) {
      console.log(`   ${row.type_code}: ${row.count} cassettes`);
    }
    
    // 6. Check newly added cassettes (the 8 we just added)
    const newCassettesQuery = `
      SELECT 
        m.serial_number_manufacturer,
        c.serial_number,
        c.usage_type
      FROM cassettes c
      JOIN machines m ON c.machine_id = m.id
      WHERE m.serial_number_manufacturer IN (
        '74UEA43N03-069966',
        '74UEA43N03-070404',
        '74UEA43N03-070270',
        '74UEA43N03-070903'
      )
      AND c.notes LIKE '%auto-generated%'
      ORDER BY m.serial_number_manufacturer, c.usage_type
    `;
    
    const newCassettesResult = await client.query(newCassettesQuery);
    
    console.log('\n🆕 NEWLY ADDED CASSETTES (8 total):');
    if (newCassettesResult.rows.length > 0) {
      for (const row of newCassettesResult.rows) {
        console.log(`   ✅ ${row.serial_number_manufacturer}: ${row.serial_number} (${row.usage_type})`);
      }
      console.log(`   Total: ${newCassettesResult.rows.length} cassettes`);
      console.log(`   Status: ${newCassettesResult.rows.length === 8 ? '✅ ALL 8 ADDED' : '⚠️ CHECK COUNT'}`);
    } else {
      console.log('   ⚠️ No auto-generated cassettes found (might be okay if notes were different)');
      
      // Check by counting cassettes for these 4 machines
      const checkQuery = `
        SELECT 
          m.serial_number_manufacturer,
          COUNT(c.id) as cassette_count
        FROM machines m
        LEFT JOIN cassettes c ON c.machine_id = m.id
        WHERE m.serial_number_manufacturer IN (
          '74UEA43N03-069966',
          '74UEA43N03-070404',
          '74UEA43N03-070270',
          '74UEA43N03-070903'
        )
        GROUP BY m.serial_number_manufacturer
        ORDER BY m.serial_number_manufacturer
      `;
      
      const checkResult = await client.query(checkQuery);
      console.log('\n   Checking cassette counts for these machines:');
      for (const row of checkResult.rows) {
        const icon = parseInt(row.cassette_count) === 10 ? '✅' : '❌';
        console.log(`   ${icon} ${row.serial_number_manufacturer}: ${row.cassette_count} cassettes`);
      }
    }
    
    // 7. Check for orphaned cassettes (no machine link)
    const orphanedQuery = `
      SELECT COUNT(*) as count
      FROM cassettes
      WHERE machine_id IS NULL
    `;
    
    const orphanedResult = await client.query(orphanedQuery);
    const orphanedCount = parseInt(orphanedResult.rows[0].count);
    
    console.log('\n🔗 CASSETTE LINKS:');
    console.log(`   Cassettes without machine: ${orphanedCount}`);
    console.log(`   Status: ${orphanedCount === 0 ? '✅ ALL LINKED' : '⚠️ SOME ORPHANED'}`);
    
    // 8. Check bank and vendor
    const bankVendorQuery = `
      SELECT 
        cb.bank_code,
        cb.bank_name,
        COUNT(DISTINCT m.id) as machine_count
      FROM machines m
      JOIN customers_banks cb ON m.customer_bank_id = cb.id
      GROUP BY cb.bank_code, cb.bank_name
    `;
    
    const bankVendorResult = await client.query(bankVendorQuery);
    
    console.log('\n🏢 BANK ASSIGNMENT:');
    for (const row of bankVendorResult.rows) {
      console.log(`   ${row.bank_code} (${row.bank_name}): ${row.machine_count} machines`);
    }
    
    // 9. Sample data check
    const sampleQuery = `
      SELECT 
        m.serial_number_manufacturer,
        m.machine_code,
        COUNT(c.id) as cassette_count
      FROM machines m
      LEFT JOIN cassettes c ON c.machine_id = m.id
      GROUP BY m.id, m.serial_number_manufacturer, m.machine_code
      ORDER BY m.serial_number_manufacturer
      LIMIT 5
    `;
    
    const sampleResult = await client.query(sampleQuery);
    
    console.log('\n📋 SAMPLE DATA (first 5 machines):');
    for (const row of sampleResult.rows) {
      const icon = parseInt(row.cassette_count) === 10 ? '✅' : '❌';
      console.log(`   ${icon} Machine: ${row.serial_number_manufacturer} (${row.machine_code}) - ${row.cassette_count} cassettes`);
    }
    
    // Final summary
    console.log('═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70));
    
    const allChecks = [
      totalMachines === 1600,
      totalCassettes === 16000,
      allHave10,
      mainCount === 8000 && backupCount === 8000,
      orphanedCount === 0,
    ];
    
    const allPassed = allChecks.every(check => check === true);
    
    if (allPassed) {
      console.log('\n✅ ✅ ✅ DATABASE IS PERFECT! ✅ ✅ ✅');
      console.log('\nAll checks passed:');
      console.log('   ✅ 1,600 machines');
      console.log('   ✅ 16,000 cassettes');
      console.log('   ✅ All machines have exactly 10 cassettes');
      console.log('   ✅ 8,000 MAIN + 8,000 BACKUP cassettes');
      console.log('   ✅ All cassettes linked to machines');
      console.log('   ✅ Data integrity maintained');
      console.log('\n🎉 DATABASE READY FOR PRODUCTION! 🎉');
    } else {
      console.log('\n⚠️  SOME CHECKS FAILED - REVIEW ABOVE');
    }
    
    console.log('\n' + '═'.repeat(70));
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

console.log('🔍 Starting Final Database Verification...\n');

finalVerification()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });

