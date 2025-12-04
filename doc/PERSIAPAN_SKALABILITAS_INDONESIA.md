# 🚀 Persiapan Skalabilitas untuk Puluhan Ribu Kaset

## 📋 Ringkasan

Dokumen ini menjelaskan persiapan yang telah dilakukan dan yang masih perlu dilakukan untuk mengelola **puluhan ribu kaset** dalam aplikasi HCM.

---

## ✅ **Yang Sudah Dilakukan**

### 1. **Database Indexes** ✅

**Status:** ✅ **SELESAI** - Indexes telah ditambahkan ke schema Prisma

**Indexes yang ditambahkan:**

#### Tabel `cassettes`:
- `customerBankId` - Filter by bank
- `machineId` - Filter by machine  
- `status` - Filter by status
- `cassetteTypeId` - Filter by type
- `customerBankId + status` (composite) - Untuk spare pool queries
- `machineId + status` (composite) - Machine + status filtering
- `createdAt` - Sorting by date

#### Tabel `repair_tickets`:
- `cassetteId + status` - Repair history lookup
- `receivedAtRc` - Date sorting
- `status` - Status filtering

#### Tabel `problem_tickets`:
- `cassetteId + status` - Active tickets check
- `machineId + status` - Machine tickets
- `reportedBy` - User tickets
- `createdAt` - Recent tickets
- `status` - Status filtering
- `reportedAt` - Date filtering

#### Tabel `ticket_cassette_details`:
- `cassetteId` - Find tickets by cassette

#### Tabel `pm_cassette_details`:
- `cassetteId + status` - Active PM tasks
- `pmId` - PM details lookup

**Cara menerapkan:**
```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
```

### 2. **Pagination Limit Fix** ✅

**Status:** ✅ **SELESAI** - Default limit diubah dari 50,000 menjadi 50

**Perubahan:**
- **Backend Controller:** Default limit: 50, max: 1000 (sebelumnya: 10,000 / 50,000)
- **Backend Service:** Default limit: 50 (sebelumnya: 50,000)

**Dampak:**
- Query lebih cepat
- Memory usage lebih rendah
- Frontend perlu diupdate untuk menggunakan pagination yang proper

---

## 🔴 **Yang Perlu Dilakukan Segera**

### 1. **Jalankan Migration Database**

**PENTING:** Indexes perlu dibuat di database:

```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
```

Atau jika di production:
```bash
npx prisma migrate deploy
```

**Waktu estimasi:** 5-30 menit tergantung jumlah data (semakin banyak data, semakin lama)

### 2. **Update Frontend Pagination**

**Masalah saat ini:**
- Frontend masih memuat semua data sekaligus (limit: 50,000)
- Perlu diubah untuk menggunakan pagination yang proper

**File yang perlu diupdate:**
- `frontend/src/app/cassettes/page.tsx` - Line 100-130
- `frontend/src/app/resources/page.tsx` - Line 105

**Solusi:**
- Gunakan pagination dengan limit 50-100 per halaman
- Implementasi "Load More" atau infinite scroll
- Jangan fetch semua halaman sekaligus

### 3. **Test Query Performance**

Setelah indexes dibuat, test dengan data real:

```sql
-- Test query dengan EXPLAIN ANALYZE
EXPLAIN ANALYZE 
SELECT * FROM cassettes 
WHERE customer_bank_id = '...' AND status = 'OK' 
LIMIT 50;

-- Harus menggunakan index, bukan sequential scan
```

---

## 🟡 **Prioritas Sedang (Bulan 1)**

### 4. **Implementasi Caching**

**Redis untuk:**
- Cassette types (cache 1 jam)
- Bank list (cache 1 jam)
- Dashboard statistics (cache 5 menit)
- User permissions (cache 15 menit)

**Setup Redis:**
```bash
# Install Redis (jika belum ada)
# Windows: Download dari https://redis.io/download
# Linux: sudo apt-get install redis-server

# Install NestJS cache manager
cd backend
npm install cache-manager cache-manager-redis-store
```

### 5. **Optimasi Query dengan Selective Includes**

**Masalah:** Query `findAll()` include `_count` untuk 3 tabel, bisa lambat

**Solusi:** Buat parameter optional untuk includes:
```typescript
async findAll(
  // ... existing params
  includeCounts: boolean = false,  // Default false
) {
  // Only include counts if needed
}
```

### 6. **Virtual Scrolling di Frontend**

**Library yang disarankan:**
```bash
cd frontend
npm install @tanstack/react-virtual
```

**Implementasi:** Lihat `SCALABILITY_PREPARATION.md` section 11

---

## 🟢 **Prioritas Rendah (Bulan 2-3)**

### 7. **Database Maintenance Automation**

**Setup cron job untuk:**
- VACUUM ANALYZE setiap hari
- Update statistics
- Monitor slow queries

### 8. **Monitoring & Logging**

**Setup:**
- PostgreSQL slow query logging
- Application performance monitoring (APM)
- Error tracking

### 9. **Load Testing**

**Test dengan:**
- 10,000 cassettes
- 50,000 cassettes
- 100,000+ cassettes

**Target metrics:**
- List query: < 500ms
- Search query: < 200ms
- Dashboard: < 1s

---

## 📊 **Estimasi Performa Setelah Optimasi**

### Sebelum Optimasi (tanpa indexes):
- Query 10,000 cassettes: **5-10 detik**
- Query dengan filter: **3-5 detik**
- Dashboard statistics: **10-20 detik**

### Setelah Optimasi (dengan indexes):
- Query 10,000 cassettes (paginated): **< 500ms**
- Query dengan filter: **< 200ms**
- Dashboard statistics: **< 1s**

### Dengan 50,000+ cassettes:
- Query paginated (50 per page): **< 500ms**
- Search by serial number: **< 100ms** (unique index)
- Filter by status: **< 300ms** (indexed)

---

## ⚠️ **Catatan Penting**

### 1. **Jangan Load Semua Data Sekaligus**
❌ **SALAH:**
```typescript
const response = await api.get('/cassettes', {
  params: { page: 1, limit: 50000 }  // JANGAN!
});
```

✅ **BENAR:**
```typescript
const response = await api.get('/cassettes', {
  params: { page: 1, limit: 50 }  // Pagination proper
});
```

### 2. **Indexes Adalah Kunci**
- Tanpa indexes, query akan lambat bahkan dengan sedikit data
- Indexes mempercepat filter, sort, dan join operations
- Trade-off: Indexes memakan storage space (tapi worth it)

### 3. **Monitor Query Performance**
- Gunakan `EXPLAIN ANALYZE` untuk melihat query plan
- Pastikan queries menggunakan indexes (bukan sequential scan)
- Identifikasi slow queries dan optimasi

### 4. **Test dengan Data Real**
- Jangan hanya test dengan 100-1000 records
- Test dengan jumlah data yang akan digunakan di production
- Monitor memory usage dan response times

---

## 📝 **Checklist Implementasi**

### Immediate (Hari ini):
- [x] Tambahkan indexes ke schema Prisma
- [x] Fix pagination limit di backend
- [ ] **Jalankan migration database** ⚠️ PENTING
- [ ] Test query performance setelah migration

### Minggu 1:
- [ ] Update frontend pagination
- [ ] Test dengan 10k+ records
- [ ] Monitor query performance
- [ ] Fix slow queries jika ada

### Bulan 1:
- [ ] Setup Redis caching
- [ ] Optimasi query dengan selective includes
- [ ] Implementasi virtual scrolling
- [ ] Setup monitoring

### Bulan 2-3:
- [ ] Database maintenance automation
- [ ] Load testing dengan 50k+ records
- [ ] Archive strategy untuk data lama
- [ ] Full APM monitoring

---

## 🔧 **Cara Menerapkan Perubahan**

### Step 1: Backup Database
```bash
# Backup sebelum migration
pg_dump -U postgres -d hcm_development > backup_before_indexes.sql
```

### Step 2: Jalankan Migration
```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
```

### Step 3: Verify Indexes
```sql
-- Check indexes yang dibuat
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('cassettes', 'repair_tickets', 'problem_tickets', 'ticket_cassette_details', 'pm_cassette_details')
ORDER BY tablename, indexname;
```

### Step 4: Test Performance
```sql
-- Test query dengan EXPLAIN
EXPLAIN ANALYZE
SELECT * FROM cassettes 
WHERE customer_bank_id = (SELECT id FROM customers_banks LIMIT 1)
AND status = 'OK'
LIMIT 50;
```

### Step 5: Update Frontend
- Update pagination di `cassettes/page.tsx`
- Update pagination di `resources/page.tsx`
- Test dengan data real

---

## 📚 **Referensi**

- **Dokumen lengkap:** `SCALABILITY_PREPARATION.md`
- **PostgreSQL Indexing:** https://www.postgresql.org/docs/current/indexes.html
- **Prisma Performance:** https://www.prisma.io/docs/guides/performance-and-optimization

---

## ❓ **FAQ**

### Q: Apakah indexes akan memperlambat INSERT/UPDATE?
**A:** Sedikit, tapi trade-off yang worth it. INSERT/UPDATE akan sedikit lebih lambat (10-20ms), tapi SELECT akan jauh lebih cepat (dari detik menjadi milidetik).

### Q: Berapa lama waktu untuk membuat indexes?
**A:** Tergantung jumlah data:
- 1,000 records: < 1 menit
- 10,000 records: 1-5 menit
- 50,000 records: 5-15 menit
- 100,000+ records: 15-30 menit

### Q: Apakah perlu downtime untuk migration?
**A:** Untuk production, sebaiknya:
- Lakukan di maintenance window
- Atau gunakan `CREATE INDEX CONCURRENTLY` (tidak lock table)

### Q: Bagaimana jika migration gagal?
**A:** 
- Restore dari backup
- Check error logs
- Fix issue dan coba lagi

---

**Last Updated:** 2025-01-XX  
**Status:** 🚧 In Progress  
**Next Step:** Jalankan migration database ⚠️

