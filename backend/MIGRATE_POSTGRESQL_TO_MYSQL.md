# 🔄 Panduan Migrasi Data dari PostgreSQL ke MySQL

Panduan ini menjelaskan cara memigrasikan data mesin dan kaset dari database PostgreSQL ke MySQL.

## 📋 Prasyarat

1. **Database MySQL sudah setup** dan berjalan
2. **Prisma schema MySQL sudah di-migrate** (`npx prisma migrate dev`)
3. **Seed data sudah dijalankan** untuk master data (banks, pengelola, cassette types)

## 🎯 Opsi Migrasi

### Opsi 1: Migrasi Langsung dari Database PostgreSQL (Recommended)

Jika Anda masih memiliki akses ke database PostgreSQL:

#### Step 1: Setup Environment Variable

Tambahkan connection string PostgreSQL ke file `.env`:

```env
# PostgreSQL (database lama)
POSTGRES_DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# MySQL (database baru - sudah ada)
DATABASE_URL=mysql://user:password@localhost:3306/database_name
```

#### Step 2: Install PostgreSQL Client (jika belum)

```bash
npm install pg @types/pg
```

#### Step 3: Jalankan Script Migrasi

```bash
cd backend
npm run migrate:postgresql-to-mysql
```

Script akan:
- ✅ Connect ke PostgreSQL
- ✅ Export semua machines dan cassettes
- ✅ Import ke MySQL (upsert - update jika sudah ada, create jika baru)
- ✅ Menampilkan summary hasil migrasi

### Opsi 2: Migrasi dari Backup SQL File

Jika Anda punya backup SQL file dari PostgreSQL:

#### Step 1: Extract Data dari SQL File

Anda perlu extract data machines dan cassettes dari SQL backup file. Script ini akan membaca INSERT statements dari SQL file.

**Note:** Script ini masih dalam pengembangan. Untuk saat ini, gunakan Opsi 1 atau import manual melalui UI.

## 📊 Data yang Akan Di-migrate

Script akan memigrasikan:

1. **Machines** - Semua mesin dengan relasi ke:
   - `customerBankId` (harus sudah ada di MySQL)
   - `pengelolaId` (harus sudah ada di MySQL)

2. **Cassettes** - Semua kaset dengan relasi ke:
   - `cassetteTypeId` (harus sudah ada di MySQL)
   - `customerBankId` (harus sudah ada di MySQL)
   - `machineId` (optional, akan di-link jika machine sudah di-import)

## ⚠️ Catatan Penting

1. **Foreign Keys Harus Sudah Ada:**
   - Banks (`customerBankId`) harus sudah ada di MySQL
   - Pengelola (`pengelolaId`) harus sudah ada di MySQL
   - Cassette Types (`cassetteTypeId`) harus sudah ada di MySQL

2. **Upsert Behavior:**
   - Jika machine/cassette dengan ID yang sama sudah ada, akan di-update
   - Jika belum ada, akan di-create baru

3. **ID Preservation:**
   - UUID dari PostgreSQL akan dipertahankan di MySQL
   - Ini memastikan relasi tetap konsisten

4. **Error Handling:**
   - Script akan continue meskipun ada error pada beberapa record
   - Error akan ditampilkan di summary

## 🔍 Verifikasi Hasil

Setelah migrasi, verifikasi data:

```bash
# Cek jumlah data
cd backend
npx ts-node scripts/check-data.ts

# Atau buka Prisma Studio
npm run prisma:studio
```

## 🐛 Troubleshooting

### Error: "POSTGRES_DATABASE_URL not found"

**Solusi:** Tambahkan `POSTGRES_DATABASE_URL` ke file `.env`

### Error: "Bank not found" atau "Pengelola not found"

**Solusi:** Pastikan seed data sudah dijalankan:
```bash
npm run prisma:seed
```

### Error: "Cassette type not found"

**Solusi:** Pastikan cassette types sudah di-seed:
```bash
npm run prisma:seed
```

### Error: Connection timeout

**Solusi:** 
- Cek apakah PostgreSQL server masih running
- Cek connection string di `.env`
- Cek firewall/network settings

## 📞 Support

Jika ada masalah:
1. Cek console log untuk error message detail
2. Pastikan semua prasyarat sudah terpenuhi
3. Verifikasi connection strings di `.env`

