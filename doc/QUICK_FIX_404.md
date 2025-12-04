# ⚡ Quick Fix: 404 Error pada Login

## 🚨 Error yang Terjadi

```
Failed to load resource: the server responded with a status of 404 (Not Found)
:3000/api/auth/login:1
```

## ✅ Solusi Cepat (3 Langkah)

### 1. Pastikan Backend Running

**Buka terminal baru dan jalankan:**

```powershell
cd "D:\HCS Cassete management\hcm\backend"
npm run start:dev
```

**Tunggu sampai muncul:**

```
✅ Database connected
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

**Jika tidak muncul pesan ini, ada error di backend - cek console!**

---

### 2. Test Backend Secara Manual

**Buka browser dan akses:**

1. **Health Check:**
   ```
   http://localhost:3000/api
   ```
   
   Harus muncul JSON:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "service": "Hitachi CRM Management API"
   }
   ```

2. **API Docs:**
   ```
   http://localhost:3000/api/docs
   ```
   
   Harus muncul Swagger UI dengan semua endpoints.

**Jika kedua URL ini error (404/connection refused):**
- ❌ Backend tidak running
- ❌ Port salah
- ❌ Ada error saat start

---

### 3. Cek Frontend Environment

**Pastikan file `frontend/.env.local` ada dan isinya:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Restart frontend setelah ubah `.env.local`:**

```powershell
# Stop frontend (Ctrl+C)
cd "D:\HCS Cassete management\hcm\frontend"
npm run dev
```

---

## 🔍 Debug Checklist

- [ ] **Backend running?** → `http://localhost:3000/api` harus OK
- [ ] **Port backend = 3000?** → Cek console saat start
- [ ] **Database connected?** → Lihat "✅ Database connected" di log
- [ ] **Frontend port = 3001?** → Default Next.js
- [ ] **`.env.local` ada di frontend?** → File harus ada
- [ ] **Backend tidak error saat start?** → Cek console untuk error

---

## 🧪 Test API Endpoint

**Buka browser dan test:**

```
http://localhost:3000/api/auth/login
```

**Jika GET method:**
- Harus dapat 404 (karena hanya POST yang valid)

**Jika POST dengan Postman/curl:**
```powershell
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Expected response:**
- ✅ 200 OK dengan access_token (jika credentials benar)
- ✅ 401 Unauthorized (jika credentials salah)
- ❌ 404 Not Found (jika backend tidak running)

---

## 🔧 Common Fixes

### Fix 1: Backend Tidak Start

**Problem:** Ada error saat `npm run start:dev`

**Solution:**
```powershell
cd backend
# Pastikan dependencies installed
npm install

# Generate Prisma Client
npx prisma generate

# Pastikan database connected
npx prisma studio

# Start backend
npm run start:dev
```

### Fix 2: Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Kill process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Atau ubah PORT di backend/.env
PORT=3001  # Ubah ke port lain
```

### Fix 3: Database Not Connected

**Problem:** Backend error karena database tidak connected

**Solution:**
1. Start PostgreSQL service
2. Cek `DATABASE_URL` di `backend/.env`
3. Test: `npx prisma studio`

---

## ✅ Verifikasi Akhir

Setelah semua fix, test:

1. **Backend Health:**
   ```
   http://localhost:3000/api → OK ✅
   ```

2. **API Docs:**
   ```
   http://localhost:3000/api/docs → Swagger UI muncul ✅
   ```

3. **Frontend Login:**
   ```
   http://localhost:3001/login → Form login muncul ✅
   ```

4. **Test Login:**
   - Username: `admin`
   - Password: `admin123`
   - Harus redirect ke dashboard ✅

---

**Masih error?** Baca **`TROUBLESHOOTING_404_ERROR.md`** untuk panduan lengkap!

