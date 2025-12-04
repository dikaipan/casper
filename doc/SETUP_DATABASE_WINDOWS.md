# 🗄️ Setup Database PostgreSQL untuk Windows

## Opsi 1: Menggunakan pgAdmin (GUI - Paling Mudah) ✅

### Langkah 1: Install PostgreSQL dengan pgAdmin

1. Download PostgreSQL untuk Windows:
   - Kunjungi: https://www.postgresql.org/download/windows/
   - Atau langsung: https://www.postgresql.org/download/
   - Pilih "Download the installer" → "Windows x86-64"
   - Pilih versi terbaru (PostgreSQL 15 atau 16)

2. Jalankan installer:
   - ✅ Pilih "PostgreSQL Server"
   - ✅ Pilih "pgAdmin 4" (GUI tool)
   - ✅ Pilih "Command Line Tools"
   - Install di lokasi default (biasanya `C:\Program Files\PostgreSQL\16`)

3. Saat install, Anda akan diminta set **PostgreSQL Superuser Password**:
   - **Password untuk user `postgres`** (simpan password ini!)
   - Misalnya: `postgres123` (atau password yang Anda inginkan)

### Langkah 2: Buka pgAdmin

1. Buka **pgAdmin 4** dari Start Menu
2. Saat pertama kali buka, akan diminta set master password untuk pgAdmin (bisa dikosongkan atau set password)
3. Connect ke server lokal (klik kanan pada "Servers" → "Register" → "Server")

### Langkah 3: Buat Database dan User

#### Metode A: Menggunakan GUI pgAdmin

1. **Buat Database:**
   - Klik kanan pada "Databases" → "Create" → "Database..."
   - **Name**: `hcm_development`
   - **Owner**: pilih `postgres`
   - Klik "Save"

2. **Buat User (Optional - bisa pakai postgres default):**
   - Klik kanan pada "Login/Group Roles" → "Create" → "Login/Group Role..."
   - **General Tab:**
     - **Name**: `hcm_user`
   - **Definition Tab:**
     - **Password**: `hcm_password`
   - **Privileges Tab:**
     - ✅ Can login? → Yes
   - Klik "Save"

3. **Berikan Akses ke Database:**
   - Klik kanan pada database `hcm_development` → "Properties"
   - Tab "Security"
   - Klik "Add" → Pilih `hcm_user` → Berikan semua privileges
   - Klik "Save"

#### Metode B: Menggunakan Query Tool (Lebih Cepat)

1. **Buka Query Tool:**
   - Klik kanan pada database `postgres` → "Query Tool"

2. **Jalankan SQL berikut:**

```sql
-- Buat database
CREATE DATABASE hcm_development;

-- Buat user baru
CREATE USER hcm_user WITH ENCRYPTED PASSWORD 'hcm_password';

-- Berikan akses ke database
GRANT ALL PRIVILEGES ON DATABASE hcm_development TO hcm_user;
```

3. **Berikan akses ke schema public:**

```sql
-- Connect ke database hcm_development
\c hcm_development

-- Berikan akses ke schema public
GRANT ALL ON SCHEMA public TO hcm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hcm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hcm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hcm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hcm_user;
```

---

## Opsi 2: Menggunakan SQL Shell (psql) - Command Line

### Langkah 1: Buka SQL Shell (psql)

1. Buka **Start Menu** → Cari "SQL Shell (psql)"
2. Atau buka dari Command Prompt/PowerShell

### Langkah 2: Connect ke PostgreSQL

```
Server [localhost]:
Database [postgres]:
Port [5432]:
Username [postgres]: postgres
Password for user postgres: (masukkan password yang Anda set saat install)
```

### Langkah 3: Jalankan SQL Commands

Setelah connect, ketik SQL berikut satu per satu (atau copy-paste):

```sql
-- Buat database
CREATE DATABASE hcm_development;

-- Buat user baru
CREATE USER hcm_user WITH ENCRYPTED PASSWORD 'hcm_password';

-- Berikan akses ke database
GRANT ALL PRIVILEGES ON DATABASE hcm_development TO hcm_user;

-- Connect ke database baru
\c hcm_development

-- Berikan akses ke schema public
GRANT ALL ON SCHEMA public TO hcm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hcm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hcm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hcm_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hcm_user;
```

Tekan **Enter** setelah setiap command.

---

## Opsi 3: Menggunakan User Postgres Default (Paling Sederhana) 🎯

Jika Anda **tidak ingin membuat user baru**, bisa pakai user `postgres` default:

### Ubah DATABASE_URL di file `.env`

Buka file `backend/.env` dan ubah menjadi:

```env
# Jika PostgreSQL tidak memerlukan password (trust authentication):
DATABASE_URL="postgresql://postgres@localhost:5432/hcm_development?schema=public"

# Atau jika PostgreSQL memerlukan password:
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/hcm_development?schema=public"
```

Ganti `YOUR_POSTGRES_PASSWORD` dengan password yang Anda set saat install PostgreSQL.

### Buat Database Saja

Buka **SQL Shell (psql)** atau **pgAdmin Query Tool**, jalankan:

```sql
CREATE DATABASE hcm_development;
```

**Selesai!** Tidak perlu buat user baru, langsung pakai `postgres`.

---

## ✅ Verifikasi Setup

### Test Koneksi dengan psql

```bash
# Buka Command Prompt atau PowerShell
psql -U hcm_user -d hcm_development -h localhost
```

Masukkan password: `hcm_password`

Jika berhasil, Anda akan masuk ke psql prompt:
```
hcm_development=>
```

Ketik `\q` untuk keluar.

### Test Koneksi dengan pgAdmin

1. Buka pgAdmin
2. Klik kanan pada "Servers" → "Register" → "Server"
3. Tab "General":
   - **Name**: `hcm_test`
4. Tab "Connection":
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `hcm_development`
   - **Username**: `hcm_user`
   - **Password**: `hcm_password`
   - ✅ Save password
5. Klik "Save"

Jika connect berhasil, database sudah siap! ✅

---

## 🔧 Troubleshooting

### Error: "password authentication failed"

**Problem:** Password salah atau user tidak ada

**Solution:**
- Pastikan password benar
- Atau gunakan user `postgres` default
- Atau reset password user di pgAdmin

### Error: "database does not exist"

**Problem:** Database belum dibuat

**Solution:**
```sql
CREATE DATABASE hcm_development;
```

### Error: "permission denied for schema public"

**Problem:** User tidak punya akses ke schema public

**Solution:**
```sql
\c hcm_development
GRANT ALL ON SCHEMA public TO hcm_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hcm_user;
```

### Error: "psql: command not found"

**Problem:** PostgreSQL bin directory tidak ada di PATH

**Solution:**
1. Tambahkan PostgreSQL bin ke PATH:
   - Biasanya: `C:\Program Files\PostgreSQL\16\bin`
2. Atau gunakan full path:
   ```
   "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
   ```

### PostgreSQL Service Tidak Running

**Problem:** Error connection refused

**Solution:**
1. Buka **Services** (Win+R → `services.msc`)
2. Cari "postgresql-x64-16" (atau versi Anda)
3. Klik kanan → "Start"
4. Atau set "Startup type" ke "Automatic"

---

## 📋 Checklist Setup Database

- [ ] PostgreSQL terinstall
- [ ] pgAdmin bisa dibuka (opsional, untuk GUI)
- [ ] Database `hcm_development` sudah dibuat
- [ ] User `hcm_user` sudah dibuat (atau pakai `postgres`)
- [ ] User punya akses ke database
- [ ] User punya akses ke schema public
- [ ] File `.env` sudah diupdate dengan DATABASE_URL yang benar
- [ ] Test koneksi berhasil

---

## 🚀 Next Step

Setelah database setup selesai, lanjut ke:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

---

**Tips:** 
- Untuk development, **Opsi 3 (pakai user postgres default)** adalah yang paling sederhana
- Untuk production, **gunakan user khusus** dengan password yang kuat

