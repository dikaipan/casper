# 🚀 Setup Manual - Hitachi CRM Management System

## Langkah-Langkah Setup Tanpa Docker

### 1️⃣ Install Prerequisites

Pastikan Anda sudah install:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- ✅ npm atau pnpm

### 2️⃣ Setup Database PostgreSQL

Buka PostgreSQL command line atau pgAdmin, lalu jalankan:

```sql
-- Buat database baru
CREATE DATABASE hcm_development;

-- Buat user baru (optional, bisa pakai user postgres default)
CREATE USER hcm_user WITH ENCRYPTED PASSWORD 'hcm_password';

-- Berikan akses ke database
GRANT ALL PRIVILEGES ON DATABASE hcm_development TO hcm_user;

-- Jika menggunakan PostgreSQL 15+, berikan akses ke schema public
\c hcm_development
GRANT ALL ON SCHEMA public TO hcm_user;
```

**Atau gunakan user default postgres:**
```
Database: hcm_development
User: postgres
Password: (password postgres Anda)
```

### 3️⃣ Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Buat file .env MANUAL (copy dari template)
# Untuk Windows PowerShell:
Copy-Item env.template .env

# Untuk Windows CMD:
copy env.template .env

# Untuk Linux/Mac:
cp env.template .env
```

**Edit file `.env`** yang baru dibuat:

Jika menggunakan user **postgres default**:
```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/hcm_development?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="24h"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3001"
```

Ganti `YOUR_POSTGRES_PASSWORD` dengan password postgres Anda.

### 4️⃣ Jalankan Database Migration & Seed

Masih di folder `backend`:

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrations
npx prisma migrate dev

# Seed database dengan sample data
npx prisma db seed
```

Jika berhasil, Anda akan melihat:
```
✅ Cassette types created
✅ Hitachi users created
✅ Bank customers created
✅ Vendors created
✅ Machines created
✅ Cassettes created
🎉 Database seed completed successfully!
```

### 5️⃣ Setup Frontend

```bash
# Masuk ke folder frontend
cd ../frontend

# Install dependencies
npm install

# Buat file .env.local MANUAL
# Untuk Windows PowerShell:
Copy-Item env.local.template .env.local

# Untuk Windows CMD:
copy env.local.template .env.local

# Untuk Linux/Mac:
cp env.local.template .env.local
```

File `.env.local` defaultnya sudah benar, tidak perlu diedit:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 6️⃣ Jalankan Aplikasi

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

Tunggu sampai muncul:
```
✅ Database connected
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

#### Terminal 2 - Frontend (Buka terminal baru)
```bash
cd frontend
npm run dev
```

Tunggu sampai muncul:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3001
```

### 7️⃣ Akses Aplikasi

Buka browser dan akses:
- 🌐 **Frontend**: http://localhost:3001
- 🔧 **Backend API**: http://localhost:3000
- 📚 **API Docs**: http://localhost:3000/api/docs

### 8️⃣ Login dengan Credentials Default

**Hitachi Users:**
```
Super Admin
Username: admin
Password: admin123

RC Manager
Username: rc_manager
Password: rcmanager123

RC Staff
Username: rc_staff_1
Password: rcstaff123
```

**Vendor Users:**
```
TAG Admin
Username: tag_admin
Password: vendor123

TAG Technician
Username: tag_tech1
Password: vendor123

ADV Admin
Username: adv_admin
Password: vendor123
```

---

## 🔧 Troubleshooting

### Error: Database Connection Failed

**Problem:** `Error: Can't reach database server at localhost:5432`

**Solution:**
1. Pastikan PostgreSQL sudah running
2. Cek service PostgreSQL:
   ```bash
   # Windows (Services)
   services.msc → cari PostgreSQL
   
   # Linux
   sudo systemctl status postgresql
   ```
3. Periksa DATABASE_URL di `.env` sudah benar

### Error: Migration Failed

**Problem:** `Error: P3005: The database schema is not empty`

**Solution:**
```bash
# Reset database (HATI-HATI: akan hapus semua data)
cd backend
npx prisma migrate reset

# Atau drop database dan buat ulang di PostgreSQL
```

### Error: Port 3000 Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows - Matikan process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: Prisma Client Not Generated

**Problem:** `Error: Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npx prisma generate
```

### Error: Module Not Found di Frontend

**Problem:** `Module not found: Can't resolve '@/...'`

**Solution:**
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📊 Verifikasi Instalasi

### Cek Database (Prisma Studio)

```bash
cd backend
npx prisma studio
```

Akan membuka GUI di http://localhost:5555 untuk lihat data di database.

### Test API dengan cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# Get Banks (gunakan token dari response login)
curl http://localhost:3000/api/banks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Frontend

1. Buka http://localhost:3001
2. Harus redirect ke halaman login
3. Login dengan `admin` / `admin123`
4. Harus masuk ke dashboard

---

## 🎯 Next Steps

Setelah setup berhasil:

1. **Explore API** - Buka http://localhost:3000/api/docs
2. **Explore Database** - Jalankan `npx prisma studio`
3. **Coba Fitur Swap Cassette** - Login sebagai technician
4. **Coba Repair Workflow** - Login sebagai RC staff

---

## 📝 Notes

- Database seed sudah include:
  - 1 Bank (BNI)
  - 2 Vendors (PT TAG, PT ADV)
  - 2 Machines
  - 13 Cassettes (installed + spare pool)
  - Sample users untuk testing

- Untuk production, HARUS ganti:
  - JWT_SECRET dengan yang lebih kuat
  - Database password
  - Semua default user passwords

---

**Butuh bantuan?** Lihat troubleshooting di atas atau baca DEPLOYMENT.md

