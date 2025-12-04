# 🔧 Troubleshooting: 404 Error pada Login

## Error yang Terjadi

```
Failed to load resource: the server responded with a status of 404 (Not Found)
:3000/api/auth/login:1
Login error: AxiosError
```

**Penyebab:** Backend API tidak bisa diakses atau belum running.

---

## ✅ Solusi 1: Pastikan Backend Running (Paling Umum)

### Cek apakah backend sudah running:

1. **Buka terminal baru** dan jalankan:

```powershell
cd "D:\HCS Cassete management\hcm\backend"
npm run start:dev
```

2. **Tunggu sampai muncul pesan:**

```
✅ Database connected
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

3. **Test endpoint secara manual:**

Buka browser dan akses:
- http://localhost:3000/api/docs (Swagger UI)
- http://localhost:3000 (Health check)

Atau test dengan curl:

```powershell
# Test health check
curl http://localhost:3000/api

# Test dengan Postman atau browser:
# GET http://localhost:3000/api
```

---

## ✅ Solusi 2: Cek Port Backend

Pastikan backend running di port **3000** (default).

**Cek file `backend/.env`:**

```env
PORT=3000
```

**Atau cek di terminal saat start backend:**
```
🚀 Application is running on: http://localhost:3000
```

Jika port berbeda, update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:PORT_YANG_BENAR
```

---

## ✅ Solusi 3: Cek CORS Configuration

Pastikan CORS di backend mengizinkan frontend:

**File `backend/.env`:**
```env
CORS_ORIGIN="http://localhost:3001"
```

**File `backend/src/main.ts`** sudah benar:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
});
```

**Restart backend** setelah ubah `.env`:

```powershell
# Stop backend (Ctrl+C)
# Start lagi
npm run start:dev
```

---

## ✅ Solusi 4: Cek Database Connection

Backend mungkin gagal start karena database tidak connected.

**Error yang mungkin muncul:**

```
❌ Error: Can't reach database server
```

**Solution:**

1. **Pastikan PostgreSQL running:**
   - Buka **Services** (Win+R → `services.msc`)
   - Cari "postgresql-x64-16" (atau versi Anda)
   - Pastikan status **Running**

2. **Cek DATABASE_URL di `backend/.env`:**

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hcm_development?schema=public"
```

3. **Test koneksi database:**

```powershell
cd backend
npx prisma studio
```

Jika Prisma Studio bisa buka, database sudah OK.

---

## ✅ Solusi 5: Rebuild Backend

Jika ada masalah dengan build:

```powershell
cd backend

# Stop running process (Ctrl+C jika ada)

# Clean install
rm -rf node_modules dist
npm install

# Generate Prisma Client
npx prisma generate

# Start lagi
npm run start:dev
```

---

## ✅ Solusi 6: Cek Route Registration

Pastikan `AuthModule` sudah terdaftar di `AppModule`:

**File `backend/src/app.module.ts`** harus include:

```typescript
imports: [
  AuthModule,  // Pastikan ini ada
  // ...
],
```

---

## 🧪 Test Endpoint Secara Manual

### Test dengan Browser:

1. **Health Check:**
   ```
   http://localhost:3000/api
   ```

   **Expected Response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-19T...",
     "uptime": 123.45,
     "service": "Hitachi CRM Management API"
   }
   ```

2. **API Docs:**
   ```
   http://localhost:3000/api/docs
   ```

   Harus muncul Swagger UI dengan semua endpoints.

### Test dengan curl:

```powershell
# Test health check
curl http://localhost:3000/api

# Test login endpoint (dapatkan 422 atau error, tapi bukan 404)
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Jika dapat 404:** Backend belum running atau route salah
**Jika dapat 422:** Backend OK, hanya validation error (expected)

---

## 📋 Checklist Debugging

- [ ] Backend sudah running (`npm run start:dev`)
- [ ] Backend tidak error saat start
- [ ] Database connected (lihat "✅ Database connected" di log)
- [ ] Health check endpoint accessible (`http://localhost:3000/api`)
- [ ] Swagger UI accessible (`http://localhost:3000/api/docs`)
- [ ] Port backend = 3000
- [ ] Port frontend = 3001
- [ ] CORS_ORIGIN = `http://localhost:3001`
- [ ] `NEXT_PUBLIC_API_URL` di frontend = `http://localhost:3000`
- [ ] Frontend sudah restart setelah ubah `.env.local`

---

## 🚀 Quick Fix Commands

```powershell
# Terminal 1 - Backend
cd "D:\HCS Cassete management\hcm\backend"
npm run start:dev

# Terminal 2 - Frontend  
cd "D:\HCS Cassete management\hcm\frontend"
npm run dev

# Terminal 3 - Test API
curl http://localhost:3000/api
```

---

## 🔍 Common Issues

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Windows - Kill process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue 2: Database Not Connected

**Error:**
```
❌ Error: Can't reach database server
```

**Solution:**
- Start PostgreSQL service
- Check DATABASE_URL di `.env`
- Test: `npx prisma studio`

### Issue 3: Module Not Found

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```powershell
cd backend
npx prisma generate
npm install
```

---

## ✅ Verifikasi Setup Lengkap

1. **Backend running:** ✅
   ```
   http://localhost:3000/api → OK
   http://localhost:3000/api/docs → OK
   ```

2. **Frontend running:** ✅
   ```
   http://localhost:3001 → Login page muncul
   ```

3. **Test Login:**
   - Username: `admin`
   - Password: `admin123`
   - Harus redirect ke dashboard

---

**Masih error?** Cek console backend untuk error messages yang lebih detail!

